"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getOrganisationMembersOptions,
  getOrganisationMembersInvitesOptions,
} from "@/queries/@tanstack/react-query.gen";
import { MembersTable } from "@/container/members/members-table";
import { InvitesTable } from "@/container/invites/invites-table";
import { InviteDialog } from "@/container/invites/invite-dialog";
import { AccountForm } from "@/container/forms/settings/account-form";
import { OrganisationForm } from "@/container/forms/settings/organisation-form";

const tabs = [
  { value: "account", label: "Account" },
  { value: "billing", label: "Billing" },
  { value: "organisation", label: "Organisation" },
  { value: "members", label: "Members" },
  { value: "notifications", label: "Notifications" },
  { value: "security", label: "Security" },
  { value: "configuration", label: "Configuration" },
] as const;

const SettingsPage = () => {
  const [tab, setTab] = useState("billing");
  const [search, setSearch] = useState("");

  const { data: membersData, isPending: membersPending } = useQuery({
    ...getOrganisationMembersOptions(),
  });

  const { data: invitesData, isPending: invitesPending } = useQuery({
    ...getOrganisationMembersInvitesOptions(),
  });

  const members = useMemo(() => {
    const items = membersData ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q),
    );
  }, [membersData, search]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <TabsList className="h-auto flex-wrap gap-1 p-2">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your billing information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                No billing information available yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
              <p className="text-base text-muted-foreground">
                Update your account details and preferences
              </p>
            </div>
            <Card className="p-6 lg:px-4">
              <AccountForm />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organisation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Organisation</h2>
              <p className="text-base text-muted-foreground">
                Manage your organisation details and preferences
              </p>
            </div>
            <Card className="p-6 lg:px-4">
              <OrganisationForm />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    Manage your organisation team members and their roles
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56 pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MembersTable members={members} isPending={membersPending} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Pending Invites</CardTitle>
                  <CardDescription>
                    View and manage organisation invitations
                  </CardDescription>
                </div>
                <InviteDialog />
              </div>
            </CardHeader>
            <CardContent>
              <InvitesTable invites={invitesData ?? []} isPending={invitesPending} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Notification preferences coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input placeholder="New password" type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input placeholder="Confirm password" type="password" />
                </div>
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Application-wide configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Configuration options coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
