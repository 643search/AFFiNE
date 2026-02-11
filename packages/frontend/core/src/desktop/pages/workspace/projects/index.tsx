import { Loading } from '@affine/component';
import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import { DocsExplorer } from '@affine/core/components/explorer/docs-view/docs-list';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { DocsService } from '@affine/core/modules/doc';
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
 * Properly loads and syncs each doc before scanning for blocks.
 */
function useDocsWithDatabaseBlocks(): {
  docIds: string[];
  loading: boolean;
} {
  const docsService = useService(DocsService);
  const nonTrashDocIds = useLiveData(docsService.list.nonTrashDocsIds$);
  const [projectDocIds, setProjectDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function scan() {
      const results: string[] = [];

      for (const docId of nonTrashDocIds) {
        if (cancelled) break;
        const docRef = docsService.open(docId);
        try {
          if (!docRef.doc.blockSuiteDoc.ready) {
            docRef.doc.blockSuiteDoc.load();
          }
          const disposePriorityLoad = docRef.doc.addPriorityLoad(10);
          await docRef.doc.waitForSyncReady();
          disposePriorityLoad();

          const blocks =
            docRef.doc.blockSuiteDoc.getBlocksByFlavour('affine:database');
          if (blocks.length > 0) {
            results.push(docId);
          }
        } catch {
          // Skip docs that fail to load
        } finally {
          docRef.release();
        }
      }

      if (!cancelled) {
        setProjectDocIds(results);
        setLoading(false);
      }
    }

    scan();
    return () => {
      cancelled = true;
    };
  }, [nonTrashDocIds, docsService]);

  return { docIds: projectDocIds, loading };
}

const ProjectsPage = () => {
  const { docIds: projectDocIds, loading } = useDocsWithDatabaseBlocks();

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
          {loading ? (
            <div className={styles.loadingState}>
              <Loading size={24} />
              <div>Scanning docs for projects...</div>
            </div>
          ) : projectDocIds.length === 0 ? (
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
