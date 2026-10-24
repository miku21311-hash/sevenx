'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { AuthShell } from '@/modules/auth/AuthShell';
import {
  clearSession,
  homeForRole,
  readRole,
  tokenFromLoginResult,
  writeRole,
  writeToken,
  type PortalRole,
} from '@/modules/auth/session';
import type { MeQueryData } from '@/modules/auth/useMe';
import { CP_TOKEN } from '@/modules/apollo/env';
import { CP_LOGIN, CP_LOGOUT, SEVENX_ME } from '@/modules/sevenx/graphql';
import { Button, Field, Input, Tabs } from '@/modules/ui';

type LoginData = { clientPortalUserLoginWithCredentials: unknown };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const client = useApolloClient();
  const [role, setRole] = useState<PortalRole>(() => readRole() ?? 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [login] = useMutation<LoginData>(CP_LOGIN);
  const [logout] = useMutation(CP_LOGOUT);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) errors.email = t('login.emailInvalid');
    if (password.length < 6) errors.password = t('login.passwordShort');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      clearSession();
      const { data } = await login({
        variables: { email: email.trim().toLowerCase(), password },
      });
      const token = tokenFromLoginResult(data?.clientPortalUserLoginWithCredentials);
      if (token) writeToken(token);

      await client.clearStore();
      const meResult = await client.query<MeQueryData>({
        query: SEVENX_ME,
        fetchPolicy: 'network-only',
      });
      const me = meResult.data?.sevenxMe ?? null;

      if (!me || me.role !== role) {
        setFormError(
          !me ? t('login.notMember') : t('login.roleMismatch', { role: t(`role.${role}`) }),
        );
        try {
          await logout();
        } finally {
          clearSession();
          await client.clearStore();
        }
        return;
      }

      writeRole(me.role);
      router.replace(homeForRole(me.role));
    } catch (err) {
      setFormError((err as Error).message || t('login.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell footer={t('login.haveInvite')}>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-xl font-semibold leading-none">{t('login.title')}</h1>
        <p className="text-accent-foreground">{t('login.subtitle')}</p>
      </div>

      <Tabs<PortalRole>
        variant="pills"
        value={role}
        onChange={setRole}
        items={[
          { key: 'teacher', label: t('role.teacher') },
          { key: 'student', label: t('role.student') },
        ]}
      />

      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        <Field label={t('common.email')} htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </Field>
        <Field label={t('common.password')} htmlFor="password" error={fieldErrors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {!CP_TOKEN && (
          <p className="animate-enter rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
            {t('login.configMissing')}
          </p>
        )}
        {formError && (
          <p
            key={formError}
            role="alert"
            className="animate-shake rounded-md border border-danger/25 bg-danger/[0.07] px-3 py-2 text-sm text-danger"
          >
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? t('login.loggingIn') : `${t('login.button')} · ${t(`role.${role}`)}`}
        </Button>
      </form>

    </AuthShell>
  );
}
