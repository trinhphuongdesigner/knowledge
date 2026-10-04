const auth = {
  errors: {
    generic: "Не удалось войти через Google. Попробуйте ещё раз.",
    closed: "Регистрация новых аккаунтов сейчас закрыта",
    disabled: "Этот аккаунт отключён",
    network: "Нет подключения к сети. Проверьте интернет и повторите попытку.",
    tooManyRequests: "Повторите попытку через несколько минут",
    unauthorizedDomain: "Этому домену не разрешён вход через Google.",
    userDisabled: "Этот аккаунт Google отключён.",
  },
  login: {
    metaTitle: "Вход — Knowledge",
    title: "Вход",
    subtitle: "С возвращением! Продолжим учиться.",
    expired: "Сеанс истёк. Войдите снова.",
    firstTime: "При первом входе аккаунт создаётся автоматически.",
    agree: "Продолжая, вы принимаете {terms} и {privacy}.",
    terms: "Условия использования",
    privacy: "Политику конфиденциальности",
    google: "Продолжить с Google",
    signingIn: "Вход…",
  },
  onboarding: {
    metaTitle: "Заполните профиль — Knowledge",
    title: "Добро пожаловать!",
    subtitle: "Расскажите немного о себе, чтобы завершить профиль ({email}).",
    submit: "Готово",
    signOut: "Выйти",
  },
};

export default auth;
