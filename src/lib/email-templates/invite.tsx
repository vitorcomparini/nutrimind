import * as React from "react";

import { Button, Heading, Text } from "@react-email/components";
import { Shell, styles } from "./_layout";

interface InviteEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
}

export const InviteEmail = ({ siteName, confirmationUrl }: InviteEmailProps) => (
  <Shell preview={`Você foi convidada(o) para o ${siteName}`}>
    <Heading as="h2" style={styles.h1}>
      Bem-vinda(o) ao NutriMind Club
    </Heading>
    <Text style={styles.text}>
      Que alegria ter você por aqui! Você recebeu um convite para acessar a nossa plataforma de
      mentoria, onde acompanhamos sua jornada com conteúdos exclusivos, aulas e suporte direto da
      nossa equipe.
    </Text>
    <Text style={styles.text}>
      O próximo passo é criar sua senha de acesso. É rápido — basta clicar no botão abaixo:
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Criar minha senha
      </Button>
    </div>
    <Text style={styles.text}>
      Após definir sua senha, você será direcionada(o) para a tela de login para fazer seu primeiro
      acesso.
    </Text>
    <Text style={{ ...styles.text, color: styles.footer.color, fontSize: "13px" }}>
      Se você não esperava este convite, pode ignorar este e-mail com segurança.
    </Text>
  </Shell>
);

export default InviteEmail;
