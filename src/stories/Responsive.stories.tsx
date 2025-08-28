import type { Meta, StoryObj } from '@storybook/react';
import { 
  Mobile, 
  TabletAndUp, 
  Desktop, 
  Responsive,
  useBreakpoint,
  useBreakpointUp,
  useBreakpointDown,
  useBreakpointBetween,
  usePixelRatio,
  useReducedMotion,
  useViewportSize,
  useMediaQuery
} from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Example component using the useBreakpoint hook
const BreakpointDisplay = () => {
  const breakpoint = useBreakpoint();
  const isMobile = useBreakpointDown('sm');
  const isTablet = useBreakpointBetween('sm', 'lg');
  const isDesktop = useBreakpointUp('lg');
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant={isMobile ? 'default' : 'secondary'}>Mobile: {String(isMobile)}</Badge>
        <Badge variant={isTablet ? 'default' : 'secondary'}>Tablet: {String(isTablet)}</Badge>
        <Badge variant={isDesktop ? 'default' : 'secondary'}>Desktop: {String(isDesktop)}</Badge>
      </div>
      <p>Current breakpoint: <strong>{breakpoint}</strong></p>
    </div>
  );
};

// Example component using the Responsive component
const ResponsiveExample = () => (
  <div className="space-y-4">
    <Responsive
      mobile={
        <div className="bg-blue-100 p-4 rounded-lg">
          This content only shows on mobile devices
        </div>
      }
      tablet={
        <div className="bg-green-100 p-4 rounded-lg">
          This content only shows on tablets
        </div>
      }
      desktop={
        <div className="bg-purple-100 p-4 rounded-lg">
          This content only shows on desktop
        </div>
      }
    >
      <div className="bg-yellow-100 p-4 rounded-lg">
        This is the default content that shows if no specific breakpoint matches
      </div>
    </Responsive>
  </div>
);

const meta: Meta = {
  title: 'Components/Responsive',
  component: Responsive,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BreakpointHooks: Story = {
  render: () => (
    <Card className="w-[350px] md:w-[500px] lg:w-[700px]">
      <CardHeader>
        <CardTitle>Breakpoint Hooks</CardTitle>
        <CardDescription>
          These hooks help you build responsive components by providing information about the current viewport size.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BreakpointDisplay />
      </CardContent>
    </Card>
  ),
};

export const ResponsiveComponent: Story = {
  render: () => (
    <Card className="w-[350px] md:w-[500px] lg:w-[700px]">
      <CardHeader>
        <CardTitle>Responsive Component</CardTitle>
        <CardDescription>
          The Responsive component conditionally renders different content based on viewport size.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveExample />
      </CardContent>
    </Card>
  ),
};

export const DeviceSpecificComponents: Story = {
  render: () => (
    <Card className="w-[350px] md:w-[500px] lg:w-[700px]">
      <CardHeader>
        <CardTitle>Device-Specific Components</CardTitle>
        <CardDescription>
          These components render their children only on specific device types.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Mobile>
          <div className="bg-blue-100 p-4 rounded-lg">
            This content only shows on mobile devices (using Mobile component)
          </div>
        </Mobile>
        
        <TabletAndUp>
          <div className="bg-green-100 p-4 rounded-lg">
            This content shows on tablet and desktop (using TabletAndUp component)
          </div>
        </TabletAndUp>
        
        <Desktop>
          <div className="bg-purple-100 p-4 rounded-lg">
            This content only shows on desktop (using Desktop component)
          </div>
        </Desktop>
      </CardContent>
    </Card>
  ),
};

// Example of using the hooks directly in a component
const DeviceInfo = () => {
  const { width, height } = useViewportSize();
  const pixelRatio = usePixelRatio();
  const prefersReducedMotion = useReducedMotion();
  const isPrint = useMediaQuery('print');
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Viewport Size</h3>
          <p>Width: {width}px</p>
          <p>Height: {height}px</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Device Info</h3>
          <p>Pixel Ratio: {pixelRatio}</p>
          <p>Prefers Reduced Motion: {String(prefersReducedMotion)}</p>
          <p>Print Mode: {String(isPrint)}</p>
        </div>
      </div>
    </div>
  );
};

export const DeviceInformation: Story = {
  render: () => (
    <Card className="w-[350px] md:w-[500px] lg:w-[700px]">
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
        <CardDescription>
          These hooks provide information about the user's device and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DeviceInfo />
      </CardContent>
    </Card>
  ),
};

// Example of using the withResponsive HOC
const ResponsiveComponent = ({ isMobile, isTablet, isDesktop }: { 
  isMobile?: boolean; 
  isTablet?: boolean; 
  isDesktop?: boolean;
}) => {
  return (
    <div className="space-y-4">
      {isMobile && <div className="bg-blue-100 p-4 rounded-lg">Mobile View</div>}
      {isTablet && <div className="bg-green-100 p-4 rounded-lg">Tablet View</div>}
      {isDesktop && <div className="bg-purple-100 p-4 rounded-lg">Desktop View</div>}
    </div>
  );
};

const ResponsiveHOC = withResponsive(ResponsiveComponent);

export const WithResponsiveHOC: Story = {
  render: () => (
    <Card className="w-[350px] md:w-[500px] lg:w-[700px]">
      <CardHeader>
        <CardTitle>withResponsive HOC</CardTitle>
        <CardDescription>
          The withResponsive higher-order component injects responsive props into your components.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveHOC />
      </CardContent>
    </Card>
  ),
};
