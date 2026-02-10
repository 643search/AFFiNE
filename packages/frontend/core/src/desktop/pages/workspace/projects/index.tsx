import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import { DocsExplorer } from '@affine/core/components/explorer/docs-view/docs-list';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { DocsService } from '@affine/core/modules/doc';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { ViewLayersIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useEffect, useMemo, useState } from 'react';

import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../modules/workbench';
import * as styles from './index.css';

const displayPreference: ExplorerDisplayPreference = {
  view: 'grid',
  displayProperties: [
    'system:updatedAt',
    'system:createdBy',
    'system:tags',
  ],
  orderBy: {
    type: 'system',
    key: 'updatedAt',
    desc: true,
  },
  groupBy: undefined,
  showDocIcon: true,
  showDocPreview: true,
  quickFavorite: true,
  showDragHandle: true,
  showMoreOperation: true,
};

/**
 * Scans workspace docs for any containing database blocks (Kanban boards, tables).
 * Returns an array of doc IDs that have at least one affine:database block.
 */
function useDocsWithDatabaseBlocks(): string[] {
  const docsService = useService(DocsService);
  const workspaceService = useService(WorkspaceService);
  const nonTrashDocIds = useLiveData(docsService.list.nonTrashDocsIds$);
  const [projectDocIds, setProjectDocIds] = useState<string[]>([]);

  useEffect(() => {
    const docCollection = workspaceService.workspace.docCollection;
    const results: string[] = [];

    for (const docId of nonTrashDocIds) {
      try {
        const store = docCollection.getDoc(docId)?.getStore({ id: docId });
        if (!store) continue;
        const dbBlocks = store.getBlocksByFlavour('affine:database');
        if (dbBlocks.length > 0) {
          results.push(docId);
        }
      } catch {
        // Skip docs that can't be scanned (not yet synced, etc.)
      }
    }

    setProjectDocIds(results);
  }, [nonTrashDocIds, workspaceService]);

  return projectDocIds;
}

const ProjectsPage = () => {
  const projectDocIds = useDocsWithDatabaseBlocks();

  const [explorerContextValue] = useState(() =>
    createDocExplorerContext(displayPreference)
  );

  const groups = useMemo(
    () => [{ key: '', items: projectDocIds }],
    [projectDocIds]
  );

  useEffect(() => {
    explorerContextValue.groups$.next(groups);
  }, [groups, explorerContextValue]);

  return (
    <DocExplorerContext.Provider value={explorerContextValue}>
      <ViewTitle title="Projects" />
      <ViewIcon icon="allDocs" />
      <ViewHeader />
      <ViewBody>
        <div className={styles.body}>
          {projectDocIds.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ViewLayersIcon />
              </div>
              <div>No projects yet</div>
              <div>
                Create a Kanban board in any doc and it will appear here
              </div>
            </div>
          ) : (
            <div className={styles.scrollArea}>
              <DocsExplorer />
            </div>
          )}
        </div>
      </ViewBody>
    </DocExplorerContext.Provider>
  );
};

export const Component = () => {
  return <ProjectsPage />;
};
