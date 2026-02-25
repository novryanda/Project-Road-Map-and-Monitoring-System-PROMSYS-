import { UserHeader } from "./_components/user-header";
import { UserTable } from "./_components/user-table";

export default function UsersPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <UserHeader />

            <div className="grid gap-6">
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Active Directory</h2>
                    </div>
                    <UserTable />
                </section>
            </div>
        </div>
    );
}