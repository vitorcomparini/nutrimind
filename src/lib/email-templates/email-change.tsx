import * as React from "react";

import { Button, Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface EmailChangeEmailProps {
  siteName: string;
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string;
  email: string;
  newEmail: string;
  confirmationUrl: string;
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Shell preview={`Confirme a alteração de e-mail no ${siteName}`}>
    <Heading as="h2" style={styles.h1}>
      Confirme seu novo e-mail
    </Heading>
    <Text style={styles.text}>
      Recebemos uma solicitação para alterar o e-mail da sua conta NutriMind Club de{" "}
      <strong>{oldEmail}</strong> para <strong>{newEmail}</strong>.
    </Text>
    <Text style={styles.text}>Clique no botão abaixo para confirmar esta alteração:</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Confirmar novo e-mail
      </Button>
    </div>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Se você não solicitou esta alteração, proteja sua conta e entre em contato com a equipe
      NutriMind.
    </Text>
  </Shell>
);

export default EmailChangeEmail;
