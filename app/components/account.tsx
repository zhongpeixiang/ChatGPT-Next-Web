import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./account.module.scss";

import ResetIcon from "../icons/reload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import LoadingIcon from "../icons/three-dots.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
} from "./ui-lib";
import { ModelConfigList } from "./model-config";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  // useUpdateStore,
  // useAccessStore,
  useAppConfig,
  useUserAuthStore,
} from "../store";

import Locale from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import { Path, SERVER_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";

interface UserConfig {
  avatar: string;
  fontSize: number;
  sidebarWidth: number;
  submitKey: string;
  theme: string;
  tightBorder: boolean;
}

interface LoginModalProps {
  setShowRegisterModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

function UserLoginModal(props: LoginModalProps) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;
  const [editingPromptId, setEditingPromptId] = useState<number>();

  // Account states
  const userAuthStore = useUserAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");

  const config = useAppConfig();
  const updateConfig = config.update;

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  async function handleLogin() {
    // Handle login logic here
    setEmailError("");
    setLoginError("");
    if (!emailRegex.test(email)) {
      // alert("Please enter a valid email address");
      setEmailError("Please enter a valid email address");
    } else {
      console.log(email);
      console.log(password);
      const response = await fetch(`${SERVER_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log("User logged in successfully!");
        updateConfig((config) => {
          config.avatar = data.config.avatar;
          config.fontSize = data.config.fontSize;
          config.sidebarWidth = data.config.sidebarWidth;
          config.submitKey = data.config.submitKey;
          config.theme = data.config.theme;
          config.tightBorder = data.config.tightBorder;
        });

        // save user info to localstorage
        userAuthStore.updateUserId(data.user_id);
        userAuthStore.updatePassword(data.password);
        // localStorage.setItem("user_id", data.user_id);
        // localStorage.setItem("password", data.password);

        props.onClose?.();
        props.setShowRegisterModal(false);
      } else {
        // console.error("Error logging in user:", data.error);
        setLoginError("Invalid email or password");
      }
    }
  }

  const handleRegisterRedirect = () => {
    props.onClose?.();
    props.setShowRegisterModal(true);
  };

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Account.Login.Title}
        onClose={() => props.onClose?.()}
      >
        <div className={styles["user-prompt-modal"]}>
          <form>
            <label htmlFor="email">{Locale.Account.Login.Email}</label>
            <input
              type="email"
              className={styles["user-modal-email"]}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError != "" && (
              <p className={styles["error-message"]}>{emailError}</p>
            )}
            <label htmlFor="password">{Locale.Account.Login.Password}</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {loginError != "" && (
              <p className={styles["error-message"]}>{loginError}</p>
            )}
            <button type="button" onClick={handleLogin}>
              {Locale.Account.Login.Actions.Title}
            </button>
            <p onClick={handleRegisterRedirect}>
              {Locale.Account.Login.Actions.Register}
            </p>
          </form>
        </div>
      </Modal>
    </div>
  );
}

interface RegisterModalProps {
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

function UserRegisterModal(props: RegisterModalProps) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;
  const [editingPromptId, setEditingPromptId] = useState<number>();

  // Account states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const usernameRegex = /^[\p{L}0-9_]+$/u;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  async function handleRegister() {
    // Handle register logic here
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setRegisterError("");
    setRegisterSuccess("");
    if (!usernameRegex.test(username)) {
      setUsernameError(
        "Please enter a valid username with letters, numbers and underscore",
      );
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        "Please enter a valid password with at least 8 characters and containing both numbers and letters",
      );
    } else if (password != confirmPassword) {
      setConfirmPasswordError("The passwords must match");
    } else {
      console.log(username);
      console.log(email);
      console.log(password);
      console.log(confirmPassword);
      const response = await fetch(`${SERVER_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log("User registered successfully!");
        setRegisterSuccess(
          "A verification email has been sent to you, please click the link provided to complete the registration process.",
        );
      } else {
        // console.error("Error registering user:", data.error);
        setRegisterError("Invalid email or password");
      }
    }
  }

  const handleLoginRedirect = () => {
    props.onClose?.();
    // props.setShowLoginModal(true);
  };

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Account.Register.Title}
        onClose={() => props.onClose?.()}
      >
        <div className={styles["user-prompt-modal"]}>
          <form>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            {usernameError != "" && (
              <p className={styles["error-message"]}>{usernameError}</p>
            )}
            <label htmlFor="email">{Locale.Account.Register.Email}</label>
            <input
              type="email"
              className={styles["user-modal-email"]}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError != "" && (
              <p className={styles["error-message"]}>{emailError}</p>
            )}
            <label htmlFor="password">{Locale.Account.Register.Password}</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {passwordError != "" && (
              <p className={styles["error-message"]}>{passwordError}</p>
            )}
            <label htmlFor="confirmPassword">
              {Locale.Account.Register.ConfirmPassword}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            {confirmPasswordError != "" && (
              <p className={styles["error-message"]}>{confirmPasswordError}</p>
            )}
            <button type="button" onClick={handleRegister}>
              {Locale.Account.Register.Actions.Title}
            </button>
            {registerError != "" && (
              <p className={styles["error-message"]}>{registerError}</p>
            )}
            {registerSuccess != "" && (
              <p className={styles["success-message"]}>{registerSuccess}</p>
            )}
            <p onClick={handleLoginRedirect}>
              {Locale.Account.Register.Actions.Login}
            </p>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export function Account() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const resetConfig = config.reset;
  const chatStore = useChatStore();
  const userAuthStore = useUserAuthStore();
  const userAuth = userAuthStore.get();
  const isLoggedIn = userAuth["user_id"] != "" && userAuth["password"] != "";
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    // userAuthStore.updateUserId("");
    // userAuthStore.updatePassword("");
    navigate(Path.Home);
  };

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{Locale.Account.Title}</div>
          {/* <div className="window-header-sub-title">
            {Locale.Settings.SubTitle}
          </div> */}
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.Account.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        {loggedIn && (
          <button type="button" onClick={handleLogout}>
            {Locale.Account.Logout.Title}
          </button>
        )}

        {showLoginModal && (
          <UserLoginModal
            onClose={() => setShowLoginModal(false)}
            setShowRegisterModal={setShowRegisterModal}
          />
        )}

        {showRegisterModal && (
          <UserRegisterModal
            onClose={() => setShowRegisterModal(false)}
            setShowLoginModal={setShowLoginModal}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
