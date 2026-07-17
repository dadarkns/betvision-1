import React, { useState, useRef } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

const LOGO = require('../assets/logo.png');

type Tab = 'login' | 'cadastro';

type AuthScreenProps = {
  onClose?: () => void;
};

function InputField({
  icon,
  placeholder,
  secure = false,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  secure?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secure && !visible}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
      />
      {secure && (
        <Pressable onPress={() => setVisible(!visible)} style={styles.eyeBtn}>
          {visible
            ? <EyeOff size={16} color={colors.muted} />
            : <Eye size={16} color={colors.muted} />
          }
        </Pressable>
      )}
    </View>
  );
}

export function AuthScreen(_props: AuthScreenProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Cadastro state
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadConfirm, setCadConfirm] = useState('');

  const switchTab = (t: Tab) => {
    Animated.timing(slideAnim, {
      toValue: t === 'login' ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setTab(t);
  };

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.overlay}>
      {/* Glows de fundo */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />
      <View style={styles.glowCenter} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>DADOS · ANÁLISE · VANTAGEM</Text>
          </View>

          {/* Card principal */}
          <View style={styles.card}>
            {/* Tab switcher */}
            <View style={styles.tabs}>
              <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
              <Pressable style={styles.tabBtn} onPress={() => switchTab('login')}>
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                  Entrar
                </Text>
              </Pressable>
              <Pressable style={styles.tabBtn} onPress={() => switchTab('cadastro')}>
                <Text style={[styles.tabText, tab === 'cadastro' && styles.tabTextActive]}>
                  Criar conta
                </Text>
              </Pressable>
            </View>

            {/* ── LOGIN ── */}
            {tab === 'login' ? (
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Bem-vindo de volta</Text>
                  <Text style={styles.formSub}>Entre na sua conta BetVision</Text>
                </View>

                <InputField
                  icon={<Mail size={16} color={colors.muted} />}
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={setLoginEmail}
                />
                <InputField
                  icon={<Lock size={16} color={colors.muted} />}
                  placeholder="Senha"
                  secure
                  value={loginSenha}
                  onChange={setLoginSenha}
                />

                <Pressable style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Esqueci minha senha</Text>
                </Pressable>

                <Pressable style={styles.primaryBtn} id="auth-login-btn">
                  <Text style={styles.primaryBtnText}>ENTRAR</Text>
                </Pressable>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou continue com</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <Pressable style={styles.socialBtn}>
                    <Text style={styles.socialBtnText}>G  Google</Text>
                  </Pressable>
                  <Pressable style={styles.socialBtn}>
                    <Text style={styles.socialBtnText}>  Apple</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* ── CADASTRO ── */
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Crie sua conta</Text>
                  <Text style={styles.formSub}>Acesse análises esportivas de elite</Text>
                </View>

                <InputField
                  icon={<User size={16} color={colors.muted} />}
                  placeholder="Seu nome completo"
                  value={cadNome}
                  onChange={setCadNome}
                />
                <InputField
                  icon={<Mail size={16} color={colors.muted} />}
                  placeholder="seu@email.com"
                  value={cadEmail}
                  onChange={setCadEmail}
                />
                <InputField
                  icon={<Lock size={16} color={colors.muted} />}
                  placeholder="Crie uma senha"
                  secure
                  value={cadSenha}
                  onChange={setCadSenha}
                />
                <InputField
                  icon={<Lock size={16} color={colors.muted} />}
                  placeholder="Confirme a senha"
                  secure
                  value={cadConfirm}
                  onChange={setCadConfirm}
                />

                <Text style={styles.termsText}>
                  Ao criar sua conta você concorda com os{' '}
                  <Text style={styles.termsLink}>Termos de uso</Text>
                  {' '}e a{' '}
                  <Text style={styles.termsLink}>Política de privacidade</Text>.
                </Text>

                <Pressable style={styles.primaryBtn} id="auth-register-btn">
                  <Text style={styles.primaryBtnText}>CRIAR CONTA GRÁTIS</Text>
                </Pressable>
              </View>
            )}

            {/* Pro badge */}
            <View style={styles.proBadge}>
              <View style={styles.proDot} />
              <Text style={styles.proText}>
                Conta Pro · Modelos preditivos · Análise em tempo real
              </Text>
            </View>
          </View>

          {/* Botão fechar / voltar */}
          <Pressable onPress={() => router.back()} style={styles.closeBtn} id="auth-close-btn">
            <Text style={styles.closeBtnText}>← Voltar ao app</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 999,
  },
  glowTopLeft: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 400,
    top: -160,
    left: -120,
    backgroundColor: 'rgba(101, 255, 75, 0.08)',
  },
  glowBottomRight: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    bottom: -140,
    right: -100,
    backgroundColor: 'rgba(120, 231, 255, 0.06)',
  },
  glowCenter: {
    position: 'absolute',
    width: 500,
    height: 200,
    borderRadius: 500,
    top: '35%',
    alignSelf: 'center',
    backgroundColor: 'rgba(101, 255, 75, 0.04)',
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.md,
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  logo: {
    width: 180,
    height: 56,
  },
  tagline: {
    ...fonts.labelMono,
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: 'rgba(18, 21, 27, 0.92)',
    overflow: 'hidden',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '50%',
    height: 2,
    backgroundColor: colors.primaryFixed,
    borderRadius: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
  },
  tabText: {
    ...fonts.labelMono,
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: colors.primaryFixed,
  },

  // Form
  form: {
    padding: 28,
    gap: 14,
  },
  formHeader: {
    gap: 4,
    marginBottom: 6,
  },
  formTitle: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    fontSize: 22,
    lineHeight: 28,
  },
  formSub: {
    ...fonts.bodyMd,
    color: colors.muted,
    fontSize: 13,
  },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 16,
  },
  inputWrapFocused: {
    borderColor: `${colors.primaryFixed}60`,
    backgroundColor: 'rgba(18, 21, 27, 0.95)',
  },
  inputIcon: {
    width: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    ...fonts.bodyMd,
    fontSize: 14,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },

  // Forgot password
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
    textTransform: 'uppercase',
  },

  // Primary button
  primaryBtn: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.white10,
  },
  dividerText: {
    ...fonts.labelMono,
    color: colors.muted,
    fontSize: 9,
    textTransform: 'uppercase',
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Terms
  termsText: {
    ...fonts.bodyMd,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -4,
  },
  termsLink: {
    color: colors.primaryFixed,
  },

  // Pro badge
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 20,
    marginTop: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(101, 255, 75, 0.15)',
    backgroundColor: 'rgba(101, 255, 75, 0.06)',
  },
  proDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
  },
  proText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },

  // Close / Back
  closeBtn: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeBtnText: {
    ...fonts.labelMono,
    color: colors.muted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
