<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import autosize from 'autosize';
import { marked } from 'marked';
import hljs from 'highlight.js';
import hljsDarkTheme from 'highlight.js/styles/stackoverflow-dark.css?url';
import hljsLightTheme from 'highlight.js/styles/stackoverflow-light.css?url';
import { type Node, loadDetails, saveDetails } from '@/helpers';
import IconPencil from '@/components/icons/IconPencil.vue';
import IconEye from '@/components/icons/IconEye.vue';
import VIconButton from '@/components/VIconButton.vue';

onMounted(() => {
  const editor = editorArea.value;
  if (editor) {
    autosize(editor);
    editor.focus();
    editor.addEventListener('keydown', (event) => {
      if (event.key == 'Tab') {
        event.preventDefault();
        let start = editor.selectionStart;
        let end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '\t' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 1;
      }
    });
    editor.addEventListener('keyup', () => {
      if (detailsNode.value) {
        saveDetails(detailsNode.value.uuid, markdown.value);
      }
    });
  }
  addEventListener('keyup', handleKeys);
});

onBeforeUnmount(() => {
  removeEventListener('keyup', handleKeys);
});

defineExpose({ show });

const emit = defineEmits(['close']);

const markdown = ref();
const detailsNode = ref<Node>();
const store = useGlobalStore();
const previewActive = ref(false);
const previewDiv = ref<HTMLDivElement>();
const editorArea = ref<HTMLTextAreaElement>();

function show(node: Node) {
  detailsNode.value = node;
  loadDetails(node.uuid).then(async (result) => {
    markdown.value = result;
    await nextTick();
    const editor = editorArea.value;
    if (editor) {
      autosize.update(editor);
    }
    if (markdown.value) {
      togglePreview();
    }
  });
}

function handleKeys(event: KeyboardEvent) {
  if (event.code == 'Escape') {
    emit('close');
  }
  if (event.ctrlKey && event.key === 'p') {
    togglePreview();
  }
}

function togglePreview() {
  if (!previewActive.value) {
    if (previewDiv.value) {
      const renderer = new marked.Renderer();
      const linkRenderer = renderer.link;
      renderer.link = (href, title, text) => {
        const html = linkRenderer.call(renderer, href, title, text);
        return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
      };
      let parsedHtml = marked.parse(markdown.value, {
        gfm: true,
        breaks: true,
        renderer,
      });
      previewDiv.value.innerHTML = parsedHtml;
    }
    hljs.highlightAll();
  }
  previewActive.value = !previewActive.value;
}
</script>

<template>
  <link rel="stylesheet" :href="hljsDarkTheme" :disabled="!store.settings.darkTheme" />
  <link rel="stylesheet" :href="hljsLightTheme" :disabled="store.settings.darkTheme" />
  <div
    class="relative flex h-full w-full justify-center bg-gray-100 px-14 py-6 dark:bg-neutral-900"
  >
    <div class="flex w-3/4 max-w-3xl flex-col gap-y-3">
      <div class="flex items-center">
        <p
          class="cursor-pointer text-gray-400 hover:underline dark:text-neutral-500"
          @click="$emit('close')"
        >
          Go Back
        </p>
        <VIconButton
          class="ml-auto text-gray-400 hover:text-gray-500 dark:text-neutral-50/50 dark:hover:text-neutral-50/80"
          @click="togglePreview()"
        >
          <IconPencil v-if="previewActive" class="h-5" />
          <IconEye v-else class="h-5" />
        </VIconButton>
      </div>
      <p class="text-2xl font-bold text-gray-600 dark:text-neutral-50">{{ detailsNode?.title }}</p>
      <p class="text-xl text-gray-400 dark:text-neutral-50/70">
        {{ detailsNode?.description }}
      </p>
      <hr class="border-t border-dashed border-gray-300 dark:border-neutral-700" />
      <div class="relative mb-6 select-auto">
        <div v-show="previewActive" id="preview" ref="previewDiv"></div>
        <textarea
          v-show="!previewActive"
          ref="editorArea"
          v-model="markdown"
          autofocus
          placeholder="Use markdown to add some details to this node..."
          rows="1"
          class="w-full resize-none bg-transparent font-mono text-neutral-900 dark:text-neutral-50"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style>
#preview h1,
#preview h2,
#preview h3 {
  margin: 1rem 0;
  border-bottom: 1px solid #d1d5db;
}
html.dark #preview h1,
html.dark #preview h2,
html.dark #preview h3 {
  border-bottom: 1px solid #404040;
}
#preview h1 {
  font-size: 1.5rem;
  line-height: 2rem;
}
#preview h2 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
#preview h3 {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
#preview p {
  margin: 1rem 0;
}
#preview ul {
  margin: 1rem 0 1rem 1rem;
  list-style-type: disc;
  list-style-position: outsise;
}
#preview ol {
  margin: 1rem 0 1rem 1rem;
  list-style-type: decimal;
  list-style-position: outside;
}
li {
  margin: 0.5rem 0;
}
#preview code {
  margin: 1rem 0;
  border: 1px solid #171717;
}
html.dark #preview code {
  margin: 1rem 0;
  border: 1px solid #404040;
}
#preview hr {
  border: 1px dashed #d1d5db;
}
html.dark #preview hr {
  border: 1px dashed #404040;
}
#preview blockquote {
  margin: 1rem 0;
  padding: 0 0.5rem;
  border-left: 0.5rem solid #34d399;
}
html.dark #preview blockquote {
  border-left: 0.5rem solid #065f46;
}
#preview a:link,
#preview a:visited {
  color: #059669;
  text-decoration: none;
}
#preview a:hover {
  text-decoration: underline;
}
</style>
