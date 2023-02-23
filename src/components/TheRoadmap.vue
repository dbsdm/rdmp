<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { mount } from 'mount-vue-component';
import RoadmapNode from './RoadmapNode.vue';
import type { Node } from '@/helpers';
import { addNode, loadRoadmap } from '@/helpers';

const nodes = ref<Array<Node>>([]);

const props = defineProps({
  roadmapUUID: { type: String, required: true },
});

watch(() => props.roadmapUUID, render);

onMounted(() => {
  render();
  addEventListener('resize', () => {
    redrawSvg(nodes.value);
  });
});

onBeforeUnmount(() => {
  removeEventListener('resize', () => {
    redrawSvg(nodes.value);
  });
});

async function render() {
  await loadRoadmap(props.roadmapUUID).then((roadmap) => {
    nodes.value = roadmap.nodes;
  });
  let root = document.getElementById('root');
  if (root) {
    root.replaceChildren();
    buildTree(nodes.value, root);
    redrawSvg(nodes.value);
  }
}

function buildTree(nodes: Array<Node>, root_el: HTMLElement) {
  nodes.forEach((node) => {
    let flexWrapper = document.createElement('div');
    flexWrapper.classList.add('my-flex');

    mount(RoadmapNode, {
      props: {
        uuid: node.uuid,
        title: node.title,
        description: node.description,
        isMainNode: node.isMainNode,
      },
      element: flexWrapper,
    });

    let childrenFlexColWrapper = document.createElement('div');
    childrenFlexColWrapper.classList.add('my-flex-col');
    flexWrapper.appendChild(childrenFlexColWrapper);

    buildTree(node.children, childrenFlexColWrapper);

    root_el.appendChild(flexWrapper);
  });
}

function redrawSvg(nodes: Array<Node>) {
  let svg = document.getElementById('svg');
  if (!svg) {
    return;
  }

  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.replaceChildren();

  drawMain(nodes);
  drawSubs(nodes);
}

function drawMain(nodes: Array<Node>) {
  nodes.forEach((_, i) => {
    let currentNode = document.querySelector(`[data-node-id='${nodes[i]?.uuid}']`);
    let followingNode = document.querySelector(`[data-node-id='${nodes[i + 1]?.uuid}']`);
    if (followingNode != null && currentNode != null) {
      drawPath(currentNode, followingNode);
    }
  });
}

function drawSubs(nodes: Array<Node>) {
  nodes.forEach((node) => {
    node.children.forEach((child) => {
      let parentNode = document.querySelector(`[data-node-id='${node.uuid}']`);
      let childNode = document.querySelector(`[data-node-id='${child.uuid}']`);
      if (parentNode != null && childNode != null) {
        drawPath(parentNode, childNode);
      }
    });
    drawSubs(node.children);
  });
}

function drawPath(fromElem: Element, toElem: Element) {
  let svg = document.getElementById('svg');
  let parentRect = document.getElementById('root')?.getBoundingClientRect();

  if (parentRect == undefined || svg == undefined) {
    console.log("'root' or 'svg' element not found");
    return;
  }

  let fromRectAbs = fromElem.getBoundingClientRect();
  let toRectAbs = toElem.getBoundingClientRect();

  let fromRect = {
    x: fromRectAbs.x - parentRect.x,
    y: fromRectAbs.y - parentRect.y,
    width: fromRectAbs.width,
    height: fromRectAbs.height,
  };
  let toRect = {
    x: toRectAbs.x - parentRect.x,
    y: toRectAbs.y - parentRect.y,
    width: toRectAbs.width,
    height: toRectAbs.height,
  };

  // @ts-ignore
  if (parseFloat(svg.getAttribute('width')) < toRect.x + toRect.width)
    svg.setAttribute('width', (toRect.x + toRect.width).toString());

  // @ts-ignore
  if (parseFloat(svg.getAttribute('height')) < toRect.y + toRect.height)
    svg.setAttribute('height', (toRect.y + toRect.height).toString());

  if (fromRect.x == toRect.x) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('connection');
    if (fromRect.width < toRect.width) {
      line.setAttribute('x1', (fromRect.x + fromRect.width / 2).toString());
      line.setAttribute('x2', (fromRect.x + fromRect.width / 2).toString());
    } else {
      line.setAttribute('x1', (toRect.x + toRect.width / 2).toString());
      line.setAttribute('x2', (toRect.x + toRect.width / 2).toString());
    }
    line.setAttribute('y1', (fromRect.y + fromRect.height).toString());
    line.setAttribute('y2', toRect.y.toString());
    svg.appendChild(line);
  } else if (fromRect.y == toRect.y) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('connection');
    line.setAttribute('x1', (fromRect.x + fromRect.width).toString());
    line.setAttribute('x2', toRect.x.toString());
    if (fromRect.height < toRect.height) {
      line.setAttribute('y1', (fromRect.y + fromRect.height / 2).toString());
      line.setAttribute('y2', (fromRect.y + fromRect.height / 2).toString());
    } else {
      line.setAttribute('y1', (toRect.y + toRect.height / 2).toString());
      line.setAttribute('y2', (toRect.y + toRect.height / 2).toString());
    }
    svg.appendChild(line);
  } else {
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('connection');

    let startX = fromRect.x + fromRect.width;
    let startY = fromRect.y + fromRect.height / 2;
    let endX = toRect.x;
    let endY = toRect.y + toRect.height / 2;
    let distanceX = endX - startX;
    let distanceY = endY - startY;

    let cpx = startX + distanceX * 0.4;
    let cpy1 = startY;
    let cpy2 = startY + distanceY;

    path.setAttribute(
      'd',
      `M ${startX} ${startY}` +
        `h ${distanceX * 0.2}` +
        `Q ${cpx} ${cpy1} ${cpx} ${startY + distanceY * 0.1}` +
        `v ${distanceY * 0.8}` +
        `Q ${cpx} ${cpy2} ${startX + distanceX * 0.7} ${startY + distanceY}` +
        `h ${distanceX * 0.3}`
    );

    svg.appendChild(path);
  }
}
</script>

<template>
  <svg id="svg" class="absolute" width="0" height="0"></svg>
  <main class="flex h-full w-full flex-col gap-10 p-10" id="root"></main>
</template>

<style>
html.dark #svg .connection {
  stroke: #404040;
  stroke-width: 0.1em;
}

#svg .connection {
  stroke: #d4d4d4;
  stroke-width: 0.1em;
}

#svg path {
  fill: none;
}

#root .my-flex {
  gap: 40px;
  display: flex;
  align-items: flex-start;
}

#root .my-flex-col {
  gap: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>