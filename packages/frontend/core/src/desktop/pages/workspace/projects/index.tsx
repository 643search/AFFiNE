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
  view: 'list',
  displayProperties: [
    'system:updatedAt',
  ],
  orderBy: {
    type: 'system',
    key: 'updatedAt',
    desc: true,
  },
  groupBy: undefined,
  showDocIcon: true,
  showDocPreview: false,
  quickFavorite: false,
  showDragHandle: false,
  showMoreOperation: true,
};

function useProjectDocIds(): string[] {
  const docsService = useService(DocsService);
  const allValues = useLiveData(
    docsService.propertyValues$('custom:isProject')
  );
  const nonTrashDocIds = useLiveData(docsService.list.nonTrashDocsIds$);

  return useMemo(() => {
    const nonTrashSet = new Set(nonTrashDocIds);
    return [...allValues.entries()]
      .filter(([id, val]) => val === 'true' && nonTrashSet.has(id))
      .map(([id]) => id);
  }, [allValues, nonTrashDocIds]);
}

const ProjectsPage = () => {
  const projectDocIds = useProjectDocIds();

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
                Use the ••• menu on any doc to add it to Projects
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
