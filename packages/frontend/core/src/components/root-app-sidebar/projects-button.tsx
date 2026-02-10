import { MenuLinkItem } from '@affine/core/modules/app-sidebar/views';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { ViewLayersIcon } from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@toeverything/infra';

export const AppSidebarProjectsButton = () => {
  const { workbenchService } = useServices({
    WorkbenchService,
  });
  const workbench = workbenchService.workbench;
  const projectsActive = useLiveData(
    workbench.location$.selector(
      location => location.pathname === '/projects'
    )
  );

  return (
    <MenuLinkItem
      data-testid="slider-bar-projects-button"
      icon={<ViewLayersIcon />}
      active={projectsActive}
      to={'/projects'}
    >
      <span data-testid="projects-page">Projects</span>
    </MenuLinkItem>
  );
};
