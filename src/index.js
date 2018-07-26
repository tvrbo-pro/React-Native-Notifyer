import React from "react";
import RootSiblings from "@bam.tech/react-native-root-siblings";

import Toast from "../lib/toast";
// import Notification from "../lib/notification";
import Loading from "../lib/loading";

const TOAST_DURATION = 4000;
const ANIMATION_DURATION = 200;

const toastQueue = [];
const notificationQueue = [];

const currentToast = {
  timeout: null,
  hidingTimeout: null,
  view: null
};
const currentNotification = {
  timeout: null,
  view: null
};
const currentLoading = {
  active: false,
  hidingTimeout: null,
  view: null
};

// PUBLIC FUNCTIONS

// TOAST

export function showToast(payload) {
  var text, params;
  if (!payload) return;
  else if (typeof payload === "object") {
    text = payload.text;
    payload.text = undefined;
    params = payload;
  }
  else if (typeof payload === "string") {
    text = payload;
    params = undefined;
  }
  else throw new Error("Invalid parameters");

  // nothing shown or something about to hide
  if (!currentToast.active || currentToast.hidingTimeout) {
    // abort hiding if necessary
    if (currentToast.hidingTimeout) {
      clearTimeout(currentToast.hidingTimeout);
      currentToast.hidingTimeout = null;
    }
    currentToast.text = text;
    currentToast.params = params;
    currentToast.active = true;

    // update/show the view
    if (currentToast.view) {
      currentToast.view.update(
        <Toast {...currentToast.params} visible={true} message={currentToast.text} />
      );
    }
    else {
      currentToast.view = new RootSiblings(
        <Toast {...currentToast.params} visible={true} message={currentToast.text} />
      );
    }

    // Done timeout
    if (currentToast.timeout) clearTimeout(currentToast.timeout);
    currentToast.timeout = setTimeout(doneToast, params.duration || TOAST_DURATION);
  }
  // queue the message
  else {
    toastQueue.push({
      text,
      params
    });
  }
}

function doneToast() {
  if (toastQueue.length) {
    const current = toastQueue.splice(0, 1)[0];
    const { text, params } = current;
    currentToast.text = text;
    currentToast.params = params;
    currentToast.active = true;

    // update/show the view
    if (currentToast.view) {
      currentToast.view.update(
        <Toast {...currentToast.params} visible={true} message={currentToast.text} />
      );
    }
    else {
      currentToast.view = new RootSiblings(
        <Toast {...currentToast.params} visible={true} message={currentToast.text} />
      );
    }

    // Done timeout
    if (currentToast.timeout) clearTimeout(currentToast.timeout);
    currentToast.timeout = setTimeout(doneToast, currentToast.params && currentToast.params.duration || TOAST_DURATION);
  }
  else {
    currentToast.timeout = null;
    hideToast();
  }
}

function hideToast() {
  currentToast.active = false;
  if (currentToast.hidingTimeout) return;

  currentToast.view.update(
    <Toast {...currentToast.params} visible={false} message={currentToast.text} />
  );
  currentToast.hidingTimeout = setTimeout(() => {
    currentToast.view.destroy();
    currentToast.view = null;
    currentToast.hidingTimeout = null;
  }, ANIMATION_DURATION);
}

// NOTIFICATION

export function showNotification({ title, text, ...params }) {
}

// LOADING SPINNER

export function showLoading(payload) {
  if (!payload) {
    currentLoading.params = {};
  }
  else if (typeof payload === "object") {
    currentLoading.title = payload.title;
    currentLoading.text = payload.text;
    payload.title = payload.text = undefined;
    currentLoading.params = payload;
  }
  else if (typeof payload === "string") {
    currentLoading.title = null;
    currentLoading.text = text;
    currentLoading.params = undefined;
  }

  currentLoading.active = true;

  // Skip hiding if scheduled
  if (currentLoading.hidingTimeout) {
    clearTimeout(currentLoading.hidingTimeout);
    currentLoading.hidingTimeout = null;
  }

  // update/show the view
  if (currentLoading.view && currentLoading.view.update) {
    currentLoading.view.update(
      <Loading {...currentLoading.params} visible={true} message={currentLoading.text} title={currentLoading.title} />
    );
  }
  else {
    currentLoading.view = new RootSiblings(
      <Loading {...currentLoading.params} visible={true} message={currentLoading.text} title={currentLoading.title} />
    );
  }
}

export function hideLoading() {
  if (!isLoading()) return;

  currentLoading.active = false;
  if (currentLoading.hidingTimeout) return;

  if (currentLoading.view && currentLoading.view.update) {
    currentLoading.view.update(
      <Loading {...currentLoading.params} visible={false} message={currentLoading.text} title={currentLoading.title} />
    );
  }
  currentLoading.hidingTimeout = setTimeout(() => {
    if (currentLoading.view.destroy) currentLoading.view.destroy();
    currentLoading.view = null;
    currentLoading.hidingTimeout = null;
  }, ANIMATION_DURATION);
}

export function isLoading() {
  return currentLoading.active;
}
