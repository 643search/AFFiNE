import { MenuLinkItem } from '@affine/core/modules/app-sidebar/views';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { useLiveData, useServices } from '@toeverything/infra';

const HomeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 14 15 14 15 21" />
  </svg>
);

export const AppSidebarHomeButton = () => {
  const { workbenchService } = useServices({
    WorkbenchService,
  });
  const workbench = workbenchService.workbench;
  const homeActive = useLiveData(
    workbench.location$.selector(location => location.pathname === '/home')
  );

  return (
    <MenuLinkItem
      data-testid="slider-bar-home-button"
      icon={<HomeIcon />}
      active={homeActive}
      to={'/home'}
    >
      <span data-testid="home-page">Home</span>
    </MenuLinkItem>
  );
};
