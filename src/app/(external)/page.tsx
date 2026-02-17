import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/project-management/project");
  return <>Coming Soon</>;
}
