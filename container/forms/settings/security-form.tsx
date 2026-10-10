"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  getUserSecuritySettingsOptions,
  getUserSecuritySettingsQueryKey,
  putUserSecuritySettingsMutation,
} from "@/queries/@tanstack/react-query.gen";
import type { GetUserSecuritySettingsResponse } from "@/queries/types.gen";
import AuthenticationService from "@/services/tokenService";

const schema = z.object({
  twoFactorEnabled: z.boolean(),
  enforceTwoFactor: z.boolean(),
  loginAlerts: z.boolean(),
  maxLoginAttempts: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1"),
  requirePinOnDelivery: z.boolean(),
  requirePinOnPickup: z.boolean(),
  ipWhitelist: z.array(z.string()),
});

type SecurityFormValues = z.infer<typeof schema>;

function toFormValues(
  settings?: GetUserSecuritySettingsResponse,
): SecurityFormValues {
  return {
    twoFactorEnabled: settings?.twoFactorEnabled ?? false,
    enforceTwoFactor: settings?.enforceTwoFactor ?? false,
    loginAlerts: settings?.loginAlerts ?? true,
    maxLoginAttempts: settings?.maxLoginAttempts ?? 5,
    requirePinOnDelivery: settings?.requirePinOnDelivery ?? false,
    requirePinOnPickup: settings?.requirePinOnPickup ?? false,
    ipWhitelist: settings?.ipWhitelist ?? [],
  };
}

function isValidIp(value: string) {
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(\/([0-9]|[12][0-9]|3[0-2]))?$/.test(
    value,
  );
}

function IpWhitelistInput({
  value,
  onChange,
  onBlur,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  onBlur: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addIp = () => {
    const ip = draft.trim();
    if (!ip) return;
    if (!isValidIp(ip)) {
      setError("Enter a valid IP address (e.g. 192.168.1.1)");
      return;
    }
    if (value.includes(ip)) {
      setError("This IP is already in the list");
      return;
    }
    onChange([...value, ip]);
    setDraft("");
    setError(null);
  };

  const removeIp = (ip: string) => {
    onChange(value.filter((entry) => entry !== ip));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onBlur={onBlur}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addIp();
            }
          }}
          placeholder="e.g. 192.168.1.1"
        />
        <Button type="button" variant="outline" onClick={addIp}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((ip) => (
            <li key={ip}>
              <Badge variant="secondary" className="gap-1 py-1 pr-1 pl-2.5">
                {ip}
                <button
                  type="button"
                  onClick={() => removeIp(ip)}
                  aria-label={`Remove ${ip}`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No restrictions — all IPs allowed.
        </p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  id,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <Field orientation="horizontal">
      <div className="flex-1">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </Field>
  );
}

function SecuritySettingsForm({
  settings,
  showEnforceTwoFactor,
}: {
  settings?: GetUserSecuritySettingsResponse;
  showEnforceTwoFactor: boolean;
}) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateSettings, isPending } = useMutation({
    ...putUserSecuritySettingsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserSecuritySettingsQueryKey(),
      });
      toast.success("Security settings updated successfully");
    },
    onError(error) {
      toast.error("Error!", {
        description:
          (error as Error)?.message || "Failed to update security settings",
      });
    },
  });

  const form = useForm({
    defaultValues: toFormValues(settings),
    validators: {
      // @ts-expect-error ignore schema error
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      await updateSettings({
        body: {
          twoFactorEnabled: value.twoFactorEnabled,
          enforceTwoFactor: value.enforceTwoFactor,
          loginAlerts: value.loginAlerts,
          maxLoginAttempts: value.maxLoginAttempts,
          requirePinOnDelivery: value.requirePinOnDelivery,
          requirePinOnPickup: value.requirePinOnPickup,
          ipWhitelist:
            value.ipWhitelist.length > 0 ? value.ipWhitelist : undefined,
        },
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="twoFactorEnabled">
          {(field) => (
            <ToggleRow
              id={field.name}
              label="Two-factor authentication"
              description="Require a second verification step when signing in"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
          )}
        </form.Field>

        {showEnforceTwoFactor && (
          <form.Field name="enforceTwoFactor">
            {(field) => (
              <ToggleRow
                id={field.name}
                label="Enforce two-factor for organisation"
                description="Require all organisation members to use two-factor authentication"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
            )}
          </form.Field>
        )}

        <form.Field name="loginAlerts">
          {(field) => (
            <ToggleRow
              id={field.name}
              label="Login alerts"
              description="Get notified of new sign-ins to your account"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
          )}
        </form.Field>

        <FieldSeparator />

        <form.Field name="requirePinOnDelivery">
          {(field) => (
            <ToggleRow
              id={field.name}
              label="Require PIN on delivery"
              description="Customers must provide a PIN before an order is marked delivered"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
          )}
        </form.Field>

        <form.Field name="requirePinOnPickup">
          {(field) => (
            <ToggleRow
              id={field.name}
              label="Require PIN on pickup"
              description="Customers must provide a PIN before an order is handed over"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
          )}
        </form.Field>

        <FieldSeparator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="maxLoginAttempts">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="maxLoginAttempts">
                    Max login attempts
                  </FieldLabel>
                  <FieldDescription>
                    Lock the account after this many failed sign-ins
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    type="number"
                    min={1}
                    step={1}
                    aria-invalid={isInvalid}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="ipWhitelist">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="ipWhitelist">IP whitelist</FieldLabel>
                <FieldDescription>
                  Only these IPs can sign in, empty allows all
                </FieldDescription>
                <IpWhitelistInput
                  value={field.state.value}
                  onChange={(ips) => field.handleChange(ips)}
                  onBlur={field.handleBlur}
                />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {({ isSubmitting }) => (
            <Button type="submit" disabled={isSubmitting || isPending}>
              {(isSubmitting || isPending) && <Spinner />}
              Save Changes
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}

export function SecurityForm() {
  const user = AuthenticationService.getUser();
  const { data: settings, isPending } = useQuery({
    ...getUserSecuritySettingsOptions(),
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <SecuritySettingsForm
      key={settings?.id ?? "new"}
      settings={settings}
      showEnforceTwoFactor={user?.role === "ORGANISATION_ADMIN"}
    />
  );
}
