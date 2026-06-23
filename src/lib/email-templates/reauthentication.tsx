import * as React from "react";

import { Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface ReauthenticationEmailProps {
  token: string;
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Shell preview="Seu código de verificação NutriMind Club">
    <Heading as="h2" style={styles.h1}>
      Confirme sua identidade
    </Heading>
    <Text style={styles.text}>Use o código abaixo para confirmar que é você:</Text>
    <Text style={styles.code}>{token}</Text>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Este código expira em breve. Se você não solicitou esta verificação, pode ignorar este e-mail.
    </Text>
  </Shell>
);

export default ReauthenticationEmail;
