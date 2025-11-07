import { SidebarTrigger } from '@/components/ui/sidebar';

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <SidebarTrigger className="md:hidden"/>
                 <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            {children && <div className="flex items-center space-x-2">{children}</div>}
        </div>
    )
}
