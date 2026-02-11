import { DocsService } from '@affine/core/modules/doc';
import { toast } from '@affine/core/utils';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

export const useProject = (pageId: string) => {
  const docsService = useService(DocsService);
  const docRecord = docsService.list.doc$(pageId).value;

  const isProject = useLiveData(docRecord?.customProperty$('isProject'));

  const toggleProject = useCallback(() => {
    if (!docRecord) return;
    const next = isProject === 'true' ? '' : 'true';
    docRecord.setCustomProperty('isProject', next);
    toast(
      next === 'true' ? 'Added to Projects' : 'Removed from Projects'
    );
  }, [isProject, docRecord]);

  return { isProject: isProject === 'true', toggleProject };
};
