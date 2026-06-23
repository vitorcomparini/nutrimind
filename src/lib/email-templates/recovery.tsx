import * as React from "react";

import { Button, Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface RecoveryEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Shell preview={`Redefina sua senha do ${siteName}`}>
    <Heading as="h2" style={styles.h1}>
      Redefinir senha
    </Heading>
    <Text style={styles.text}>
      Recebemos uma solicitação para redefinir sua senha de acesso ao NutriMind Club.
    </Text>
    <Text style={styles.text}>Clique no botão abaixo para escolher uma nova senha:</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Redefinir minha senha
      </Button>
    </div>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Se você não solicitou esta alteração, pode ignorar este e-mail. Sua senha atual continuará a
      mesma.
    </Text>
  </Shell>
);

export default RecoveryEmail;
