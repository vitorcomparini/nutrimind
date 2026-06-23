import * as React from "react";

import { Button, Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface SignupEmailProps {
  siteName: string;
  siteUrl: string;
  recipient: string;
  confirmationUrl: string;
}

export const SignupEmail = ({ siteName, recipient, confirmationUrl }: SignupEmailProps) => (
  <Shell preview={`Confirme seu e-mail para acessar o ${siteName}`}>
    <Heading as="h2" style={styles.h1}>
      Confirme seu e-mail
    </Heading>
    <Text style={styles.text}>
      Falta só confirmar o endereço <strong>{recipient}</strong> para liberar seu acesso ao
      NutriMind Club.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Confirmar e-mail
      </Button>
    </div>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Se você não criou uma conta, pode ignorar este e-mail com segurança.
    </Text>
  </Shell>
);

export default SignupEmail;
