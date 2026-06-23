import * as React from "react";

import { Button, Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface MagicLinkEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Shell preview={`Seu link de acesso ao ${siteName}`}>
    <Heading as="h2" style={styles.h1}>
      Seu link de acesso
    </Heading>
    <Text style={styles.text}>
      Use o botão abaixo para entrar com segurança no NutriMind Club. Este link expira em breve.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Acessar minha conta
      </Button>
    </div>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Se você não solicitou este acesso, pode ignorar este e-mail com segurança.
    </Text>
  </Shell>
);

export default MagicLinkEmail;
