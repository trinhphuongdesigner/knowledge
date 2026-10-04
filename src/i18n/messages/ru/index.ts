import type { DeepPartial, Messages } from "../types";
import common from "./common";
import layout from "./layout";
import auth from "./auth";
import account from "./account";
import sets from "./sets";
import cards from "./cards";
import study from "./study";
import quiz from "./quiz";
import review from "./review";
import library from "./library";
import search from "./search";
import categories from "./categories";
import importNs from "./import";
import notifications from "./notifications";
import stats from "./stats";
import errors from "./errors";
import admin from "./admin";
import legal from "./legal";

const messages: DeepPartial<Messages> = {
  common,
  layout,
  auth,
  account,
  sets,
  cards,
  study,
  quiz,
  review,
  library,
  search,
  categories,
  import: importNs,
  notifications,
  stats,
  errors,
  admin,
  legal,
};

export default messages;
