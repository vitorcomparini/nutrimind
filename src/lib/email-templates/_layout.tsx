import * as React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from '@react-email/components'

// Layout/identidade visual compartilhada — NutriMind Club
export const brand = {
  primary: '#5b1a2e', // bordô
  primaryDark: '#3f0f1f',
  gold: '#b58a3b',
  text: '#3a2a30',
  muted: '#7a6c70',
  bg: '#ffffff',
  card: '#fdf8f3',
}

export const styles = {
  main: { backgroundColor: brand.bg, fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0 },
  container: { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' },
  header: { textAlign: 'center' as const, padding: '0 0 24px', borderBottom: `2px solid ${brand.gold}` },
  brandName: { color: brand.primary, fontSize: '24px', fontWeight: 'bold' as const, letterSpacing: '0.04em', margin: 0 },
  brandTagline: { color: brand.muted, fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, margin: '6px 0 0' },
  card: { backgroundColor: brand.card, borderRadius: '12px', padding: '28px 28px 32px', margin: '24px 0' },
  h1: { fontSize: '22px', color: brand.primary, margin: '0 0 16px', fontWeight: 'normal' as const },
  text: { fontSize: '15px', color: brand.text, lineHeight: '1.6', margin: '0 0 18px' },
  button: {
    backgroundColor: brand.primary, color: '#ffffff', fontSize: '15px',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '8px', padding: '14px 28px', textDecoration: 'none',
    display: 'inline-block', fontWeight: 'bold' as const,
  },
  buttonWrap: { textAlign: 'center' as const, margin: '24px 0' },
  code: {
    fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const,
    color: brand.primary, letterSpacing: '0.3em',
    textAlign: 'center' as const, padding: '20px', backgroundColor: '#fff',
    borderRadius: '8px', border: `1px solid ${brand.gold}`, margin: '0 0 24px',
  },
  footer: { fontSize: '12px', color: brand.muted, lineHeight: '1.5', margin: '24px 0 0', textAlign: 'center' as const },
  link: { color: brand.primary, textDecoration: 'underline' },
}

interface ShellProps {
  preview: string
  children: React.ReactNode
}

export const Shell = ({ preview, children }: ShellProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading as="h1" style={styles.brandName}>NutriMind Club</Heading>
          <Text style={styles.brandTagline}>Mentoria · Nutrição & Mente</Text>
        </Section>
        <Section style={styles.card}>{children}</Section>
        <Text style={styles.footer}>
          Você está recebendo este e-mail porque possui (ou recebeu um convite para) uma conta no NutriMind Club.
          <br />
          © {new Date().getFullYear()} NutriMind Club · nutrimindclub.com.br
        </Text>
      </Container>
    </Body>
  </Html>
)
