import {
  Banknote,
  CalendarDays,
  ChartBar,
  ClipboardList,
  FolderCheckIcon,
  LayoutDashboard,
  type LucideIcon,
  ReceiptText,
  Settings2Icon,
  Users,
  UsersRound,
} from "lucide-react";

export type UserRole = "ADMIN" | "PROJECTMANAGER" | "FINANCE" | "EMPLOYEES";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  allowedRoles?: UserRole[];
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  allowedRoles?: UserRole[];
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
  allowedRoles?: UserRole[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
        allowedRoles: ["ADMIN"],
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
        comingSoon: true,
        allowedRoles: ["ADMIN"],
      },
      {
        title: "Project Management",
        url: "/dashboard/project-management",
        icon: FolderCheckIcon,
        allowedRoles: ["ADMIN", "PROJECTMANAGER", "EMPLOYEES"],
        subItems: [
          { title: "Project", url: "/dashboard/project-management/project", allowedRoles: ["ADMIN", "PROJECTMANAGER"] },
          { title: "Tasks", url: "/dashboard/project-management/tasks", allowedRoles: ["ADMIN", "PROJECTMANAGER", "EMPLOYEES"] },
          { title: "Calendar", url: "/dashboard/project-management/calendar", allowedRoles: ["ADMIN", "PROJECTMANAGER", "EMPLOYEES"] },
          {
            title: "Teams",
            url: "/dashboard/project-management/teams",
            comingSoon: true,
            allowedRoles: ["ADMIN", "PROJECTMANAGER"],
          },
        ],
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
        allowedRoles: ["ADMIN", "FINANCE"],
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "Invoice",
        url: "/dashboard/invoice",
        icon: ReceiptText,
        allowedRoles: ["ADMIN", "FINANCE", "PROJECTMANAGER", "EMPLOYEES"],
        subItems: [
          {
            title: "View Invoice",
            url: "/dashboard/invoice",
            allowedRoles: ["ADMIN", "FINANCE"],
          },
          {
            title: "Create Invoice",
            url: "/dashboard/invoice/create",
            allowedRoles: ["ADMIN", "FINANCE"],
          },
          {
            title: "Reimbursement",
            url: "/dashboard/reimbursement",
            allowedRoles: ["ADMIN", "FINANCE", "PROJECTMANAGER", "EMPLOYEES"],
          },
        ],
      },
      {
        title: "Users",
        url: "/pages/users",
        icon: Users,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    id: 3,
    label: "Settings",
    allowedRoles: ["ADMIN", "FINANCE"],
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2Icon,
        allowedRoles: ["ADMIN", "FINANCE"],
        subItems: [
          {
            title: "Category",
            url: "/settings/category",
            allowedRoles: ["ADMIN"],
          },
          {
            title: "Vendor",
            url: "/settings/vendor",
            allowedRoles: ["ADMIN", "FINANCE"],
          },
          {
            title: "Tax",
            url: "/settings/tax",
            allowedRoles: ["ADMIN", "FINANCE"],
          },
        ],
      },
    ],
  },
];

/**
 * Filter sidebar items based on user role.
 * Items without allowedRoles are visible to all roles.
 */
export function filterSidebarByRole(
  items: NavGroup[],
  role: UserRole,
): NavGroup[] {
  return items
    .filter((group) => !group.allowedRoles || group.allowedRoles.includes(role))
    .map((group) => ({
      ...group,
      items: group.items
        .filter(
          (item) =>
            !item.allowedRoles || item.allowedRoles.includes(role),
        )
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter(
            (sub) =>
              !sub.allowedRoles || sub.allowedRoles.includes(role),
          ),
        })),
    }))
    .filter((group) => group.items.length > 0);
}
