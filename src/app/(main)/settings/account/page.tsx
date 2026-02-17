import { ProfileForm } from "./_components/profile-form";
import { SecuritySettings } from "./_components/security-settings";

export default function AccountPage() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
					<p className="text-muted-foreground">
						Manage your personal profile, security, and interface preferences.
					</p>
				</div>
			</div>

			<div className="grid gap-8">
				<ProfileForm />
				<SecuritySettings />
			</div>
		</div>
	);
}
