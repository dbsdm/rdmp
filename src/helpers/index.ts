import { useGlobalStore } from '@/stores/global';
import { invoke } from '@tauri-apps/api/tauri';
import { cloneDeep } from 'lodash';

export type Roadmap = {
  uuid: string;
  title: string;
  description: string;
  nodes: Array<Node>;
};

export type Node = {
  uuid: string;
  title: string;
  description: string;
  nodeType: string;
  nodeOrder: number;
  done: boolean;
  skip: boolean;
  children: Array<Node>;
};

export function loadRoadmap(uuid: string): Promise<Roadmap> {
  return new Promise((resolve) =>
    invoke<Roadmap>('load_roadmap', { queryUuid: uuid })
      .then((roadmap) => {
        resolve(roadmap);
      })
      .catch((e) => {
        console.log(e);
      })
  );
}

export function loadAllRoadmaps() {
  const store = useGlobalStore();
  invoke<Roadmap[]>('load_all_roadmaps')
    .then((result) => {
      store.roadmaps = cloneDeep(result);
    })
    .catch((e) => {
      console.log(e);
    });
}

export function addRoadmap(roadmap: Roadmap): Promise<null> {
  return invoke<null>('add_roadmap', { roadmap: roadmap });
}

export function updateRoadmap(roadmap: Roadmap) {
  invoke<null>('update_roadmap', { roadmap: roadmap })
    .then(() => {
      loadAllRoadmaps();
    })
    .catch((e) => {
      console.log(e);
    });
}

export function removeRoadmap(uuid: String) {
  invoke<null>('remove_roadmap', { queryUuid: uuid })
    .then(() => {
      loadAllRoadmaps();
    })
    .catch((e) => {
      console.log(e);
    });
}

export function addNode(
  node: Node,
  parentNodeUUID: String | null,
  roadmapUUID: String
): Promise<null> {
  return invoke<null>('add_node', {
    node: node,
    parentNodeUuid: parentNodeUUID,
    queryRoadmapUuid: roadmapUUID,
  });
}

export function updateNode(node: Node): Promise<null> {
  return invoke<null>('update_node', {
    node: node,
  });
}

export function removeNode(uuid: String): Promise<null> {
  return invoke<null>('remove_node', {
    queryUuid: uuid,
  });
}

export function setDone(uuid: String, done: boolean): Promise<null> {
  return invoke<null>('set_done', {
    queryUuid: uuid,
    queryDone: done,
  });
}

export function setSkip(uuid: String, skip: boolean): Promise<null> {
  return invoke<null>('set_skip', {
    queryUuid: uuid,
    querySkip: skip,
  });
}

export function loadDetails(uuid: String): Promise<String> {
  return invoke<String>('load_details', {
    queryUuid: uuid,
  });
}

export function saveDetails(uuid: String, details: String): Promise<null> {
  return invoke<null>('save_details', {
    queryUuid: uuid,
    queryString: details,
  });
}

export function getRoadmapsAmount(): Promise<number> {
  return invoke<number>('load_roadmaps_amount');
}

export function getNodesAmount(): Promise<number> {
  return invoke<number>('load_nodes_amount');
}

export function writeSettings(): Promise<null> {
  const store = useGlobalStore();
  return invoke<null>('write_settings', { settings: store.settings });
}

export function readSettings(): Promise<any> {
  return invoke<any>('read_settings');
}

export function exportRoadmap(uuid: string, title: string, folder: string): Promise<null> {
  return invoke<null>('export_roadmap', { queryUuid: uuid, title: title, folder: folder });
}

export function importRoadmap(path: string): Promise<Roadmap> {
  return invoke<Roadmap>('import_roadmap', { path: path });
}

export function expandNodesAround(roadmapUuid: string, around: number): Promise<null> {
  return invoke<null>('expand_nodes_around', { queryUuid: roadmapUuid, around: around });
}

export function squashNodesAround(roadmapUuid: string, around: number): Promise<null> {
  return invoke<null>('squash_nodes_around', { queryUuid: roadmapUuid, around: around });
}

export {};
