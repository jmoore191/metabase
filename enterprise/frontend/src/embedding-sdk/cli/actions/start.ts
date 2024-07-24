import { confirm, input } from "@inquirer/prompts";

import { uuid } from "metabase/lib/uuid";

import {
  checkIsDockerRunning,
  startLocalMetabaseContainer,
} from "../utils/docker";
import { showGettingStartedGuide } from "../utils/getting-started";
import { pollUntilMetabaseInstanceReady } from "../utils/health-check";
import { checkInReactProject } from "../utils/is-in-react-project";
import { printError } from "../utils/print";
import { setupMetabaseInstance } from "../utils/setup-metabase-instance";

const START_MESSAGE = `
  This command will help you bootstrap a local Metabase instance and embed
  analytics into your React app using the Metabase Embedding SDK.
`;

const DOCKER_NOT_RUNNING_MESSAGE = `
  Docker is not running. Please install and start the Docker daemon before running this command.
  For more information, see https://docs.docker.com/engine/install
`;

const isEmail = (email: string) => email.match(/^\S+@\S+\.\S+$/) !== null;

export async function start() {
  try {
    console.log(START_MESSAGE);

    const isInReactProject = await checkInReactProject();

    if (!isInReactProject) {
      return;
    }

    const shouldStart = await confirm({ message: "Continue?" });

    if (!shouldStart) {
      printError("Aborted.");
      return;
    }

    const isDockerRunning = await checkIsDockerRunning();

    if (!isDockerRunning) {
      printError(DOCKER_NOT_RUNNING_MESSAGE);
      return;
    }

    const email = await input({
      message: "What is the email address you want to use for the admin user?",
      validate: isEmail,
    });

    // TODO: auto-generate a password
    const password = "<AUTOGENERATED-PASSWORD>";

    const setupToken = uuid();

    const port = await startLocalMetabaseContainer({ setupToken });

    if (!port) {
      return;
    }

    const instanceUrl = `http://localhost:${port}`;

    await pollUntilMetabaseInstanceReady(instanceUrl);

    await setupMetabaseInstance({
      instanceUrl,
      setupToken,
      email,
      password,
    });

    await showGettingStartedGuide(port);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("force closed the prompt")) {
        printError("Aborted.");
        return;
      }
    }

    printError("An error occurred.");
    console.log(error);
  }
}
