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
} from "../store";

import Locale, {
  AllLangs,
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
} from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import { Path, SERVER_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
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
      } else {
        console.error("Error logging in user:", data.error);
      }
    }
  }

  const handleRegister = () => {
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
            <label htmlFor="password">{Locale.Account.Login.Password}</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <button type="button" onClick={handleLogin}>
              {Locale.Account.Login.Actions.Title}
            </button>
            <p onClick={handleRegister}>
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
    if (!usernameRegex.test(username)) {
      alert(
        "Please enter a valid username with letters, numbers and underscore",
      );
    } else if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
    } else if (!passwordRegex.test(password)) {
      alert(
        "Please enter a valid password with at least 8 characters and containing both numbers and letters",
      );
    } else if (password != confirmPassword) {
      alert("The passwords must match");
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
      } else {
        console.error("Error registering user:", data.error);
      }
    }
  }

  const handleLogin = () => {
    props.onClose?.();
    props.setShowLoginModal(true);
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
            <label htmlFor="email">{Locale.Account.Register.Email}</label>
            <input
              type="email"
              className={styles["user-modal-email"]}
              value={email}
              onChange={handleEmailChange}
              required
            />
            <label htmlFor="password">{Locale.Account.Register.Password}</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <label htmlFor="confirmPassword">
              {Locale.Account.Register.ConfirmPassword}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <button type="button" onClick={handleRegister}>
              {Locale.Account.Register.Actions.Title}
            </button>
            <p onClick={handleLogin}>{Locale.Account.Register.Actions.Login}</p>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function UserPromptModal(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  const [editingPromptId, setEditingPromptId] = useState<number>();

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            onClick={() =>
              promptStore.add({
                title: "Empty Prompt",
                content: "Empty Prompt Content",
              })
            }
            icon={<AddIcon />}
            bordered
            text={Locale.Settings.Prompt.Modal.Add}
          />,
        ]}
      >
        <div className={styles["user-prompt-modal"]}>
          <input
            type="text"
            className={styles["user-prompt-search"]}
            placeholder={Locale.Settings.Prompt.Modal.Search}
            value={searchInput}
            onInput={(e) => setSearchInput(e.currentTarget.value)}
          ></input>

          <div className={styles["user-prompt-list"]}>
            {prompts.map((v, _) => (
              <div className={styles["user-prompt-item"]} key={v.id ?? v.title}>
                <div className={styles["user-prompt-header"]}>
                  <div className={styles["user-prompt-title"]}>{v.title}</div>
                  <div className={styles["user-prompt-content"] + " one-line"}>
                    {v.content}
                  </div>
                </div>

                <div className={styles["user-prompt-buttons"]}>
                  {v.isUser && (
                    <IconButton
                      icon={<ClearIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => promptStore.remove(v.id!)}
                    />
                  )}
                  {v.isUser ? (
                    <IconButton
                      icon={<EditIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => setEditingPromptId(v.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EyeIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => setEditingPromptId(v.id)}
                    />
                  )}
                  <IconButton
                    icon={<CopyIcon />}
                    className={styles["user-prompt-button"]}
                    onClick={() => copyToClipboard(v.content)}
                  />
                </div>
              </div>
            ))}
          </div>
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
  const [shouldShowLoginModal, setShowLoginModal] = useState(true);
  const [shouldShowRegisterModal, setShowRegisterModal] = useState(false);

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
        <List>
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>

          <ListItem title={Locale.Settings.SendKey}>
            <Select
              value={config.submitKey}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.submitKey = e.target.value as any as SubmitKey),
                );
              }}
            >
              {Object.values(SubmitKey).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem title={Locale.Settings.Theme}>
            <Select
              value={config.theme}
              onChange={(e) => {
                updateConfig(
                  (config) => (config.theme = e.target.value as any as Theme),
                );
              }}
            >
              {Object.values(Theme).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem title={Locale.Settings.Lang.Name}>
            <Select
              value={getLang()}
              onChange={(e) => {
                changeLang(e.target.value as any);
              }}
            >
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem
            title={Locale.Settings.FontSize.Title}
            // subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="18"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </ListItem>
        </List>

        {shouldShowLoginModal && (
          <UserLoginModal
            onClose={() => setShowLoginModal(false)}
            setShowRegisterModal={setShowRegisterModal}
          />
        )}
        {shouldShowRegisterModal && (
          <UserRegisterModal
            onClose={() => setShowRegisterModal(false)}
            setShowLoginModal={setShowLoginModal}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
