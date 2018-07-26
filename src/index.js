import React from "react";
import RootSiblings from "@bam.tech/react-native-root-siblings";

import Toast from "../lib/toast";
import Notification from "../lib/notification";
import Loading from "../lib/loading";

const TOAST_DURATION = 3000;
const NOTIFICATION_DURATION = 5000;
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
  hidingTimeout: null,
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
    params = {};
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

export function showNotification(payload) {
  var title, text, params;
  if (!payload) return;
  else if (typeof payload === "object") {
    title = payload.title;
    text = payload.text;
    payload.title = undefined;
    payload.text = undefined;
    params = payload;
  }
  else if (typeof payload === "string") {
    title = "";
    text = payload;
    params = {};
  }
  else throw new Error("Invalid parameters");

  // nothing shown or something about to hide
  if (!currentNotification.active || currentNotification.hidingTimeout) {
    // abort hiding if necessary
    if (currentNotification.hidingTimeout) {
      clearTimeout(currentNotification.hidingTimeout);
      currentNotification.hidingTimeout = null;
    }
    currentNotification.text = text;
    currentNotification.title = title;
    currentNotification.params = params;
    currentNotification.active = true;

    // update/show the view
    if (currentNotification.view) {
      currentNotification.view.update(
        <Notification {...currentNotification.params} visible={true} message={currentNotification.text} title={currentNotification.title} duration={params.duration || NOTIFICATION_DURATION} />
      );
    }
    else {
      currentNotification.view = new RootSiblings(
        <Notification {...currentNotification.params} visible={true} message={currentNotification.text} title={currentNotification.title} duration={params.duration || NOTIFICATION_DURATION} />
      );
    }

    // Done timeout
    if (currentNotification.timeout) clearTimeout(currentNotification.timeout);
    currentNotification.timeout = setTimeout(doneNotification, params.duration || NOTIFICATION_DURATION);
  }
  // queue the message
  else {
    notificationQueue.push({
      text,
      title,
      params
    });
  }
}

function doneNotification() {
  if (notificationQueue.length) {
    const current = notificationQueue.splice(0, 1)[0];
    const { text, title, params } = current;
    currentNotification.text = text;
    currentNotification.title = title;
    currentNotification.params = params;
    currentNotification.active = true;

    // update/show the view
    if (currentNotification.view) {
      currentNotification.view.update(
        <Notification {...currentNotification.params} visible={true} message={currentNotification.text} title={currentNotification.title} duration={currentNotification.params.duration || NOTIFICATION_DURATION} />
      );
    }
    else {
      currentNotification.view = new RootSiblings(
        <Notification {...currentNotification.params} visible={true} message={currentNotification.text} title={currentNotification.title} duration={currentNotification.params.duration || NOTIFICATION_DURATION} />
      );
    }

    // Done timeout
    if (currentNotification.timeout) clearTimeout(currentNotification.timeout);
    currentNotification.timeout = setTimeout(doneNotification, currentNotification.params && currentNotification.params.duration || NOTIFICATION_DURATION);
  }
  else {
    currentNotification.timeout = null;
    hideNotification();
  }
}

function hideNotification() {
  currentNotification.active = false;
  if (currentNotification.hidingTimeout) return;

  currentNotification.view.update(
    <Notification {...currentNotification.params} visible={false} message={currentNotification.text} title={currentNotification.title} duration={currentNotification.params.duration || NOTIFICATION_DURATION} />
  );
  currentNotification.hidingTimeout = setTimeout(() => {
    currentNotification.view.destroy();
    currentNotification.view = null;
    currentNotification.hidingTimeout = null;
  }, ANIMATION_DURATION);
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
    currentLoading.params = {};
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
