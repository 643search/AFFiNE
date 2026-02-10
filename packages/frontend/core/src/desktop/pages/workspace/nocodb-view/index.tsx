import { useCallback } from 'react';
import { createPortal } from 'react-dom';

import { WorkbenchService } from '@affine/core/modules/workbench';
import { useServices } from '@toeverything/infra';

export const Component = () => {
  const { workbenchService } = useServices({ WorkbenchService });

  const goBack = useCallback(() => {
    workbenchService.workbench.openDoc('/all');
  }, [workbenchService]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      <button
        onClick={goBack}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10000,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: 0.8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
      >
        ← AFFiNE
      </button>
      <iframe
        src="http://localhost:3000"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          flex: 1,
        }}
        title="NocoDB Database"
        allow="clipboard-read; clipboard-write"
      />
    </div>,
    document.body
  );
};
