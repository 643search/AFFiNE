import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import { DocsExplorer } from '@affine/core/components/explorer/docs-view/docs-list';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { useService } from '@toeverything/infra';
import { useEffect, useState } from 'react';

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

const HomePage = () => {
  const collectionRulesService = useService(CollectionRulesService);

  const [explorerContextValue] = useState(() =>
    createDocExplorerContext(displayPreference)
  );

  useEffect(() => {
    const subscription = collectionRulesService
      .watch({
        filters: [
          {
            type: 'system',
            key: 'trash',
            method: 'is',
            value: 'false',
          },
        ],
        orderBy: {
          type: 'system',
          key: 'updatedAt',
          desc: true,
        },
        extraFilters: [
          {
            type: 'system',
            key: 'empty-journal',
            method: 'is',
            value: 'false',
          },
        ],
      })
      .subscribe({
        next: result => {
          explorerContextValue.groups$.next(result.groups);
        },
        error: error => {
          console.error(error);
        },
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [collectionRulesService, explorerContextValue]);

  return (
    <DocExplorerContext.Provider value={explorerContextValue}>
      <ViewTitle title="Home" />
      <ViewIcon icon="allDocs" />
      <ViewHeader />
      <ViewBody>
        <div className={styles.body}>
          <div className={styles.scrollArea}>
            <DocsExplorer />
          </div>
        </div>
      </ViewBody>
    </DocExplorerContext.Provider>
  );
};

export const Component = () => {
  return <HomePage />;
};
