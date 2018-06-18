import React from "react";
import RootSiblings from "@bam.tech/react-native-root-siblings";

import Toast from "../lib/toast";
import Notification from "../lib/notification";
import Loading from "../lib/loading";

var messageQueue = [];
var defaults = {
  duration: 4000,
  animation: 250
};

// Public functions

export function show(display = "toast", message, title, options = {}) {
  if (["toast", "notification", "loading"].indexOf(display) < 0)
    throw new Error("Invalid display type");
  else if (typeof message != "string" && display != "loading")
    throw new Error("The message must be a string");
  else if (title && typeof title != "string")
    throw new Error("The title must be a string or null");

  options = Object.assign({}, defaults, options);

  const idx = Date.now();
  messageQueue.push({
    idx,
    visible: true,
    display,
    message,
    title,
    options,
    view: null // will be set when displayed
  });

  if (messageQueue.length == 1) displayCurrent();
  return idx;
}

export function showToast(message, options = {}) {
  return show("toast", message, null, options); // return idx
}

export function showNotification(message, title, options) {
  if (typeof options == "undefined" && typeof title == "object"){
    options = title;
    title = null;
  }
  return show("notification", message, title, options); // return idx
}

export function showLoading(message, title, options) {
  if (typeof options == "undefined" && typeof title == "object"){
    options = title;
    title = null;
  }
  return show("loading", message, title, options); // return idx
}

export function hideLoading() {
  for (let i = 0; i < messageQueue.length; i++) {
    if ("loading" != messageQueue[i].display) continue;

    if (i == 0) {
      // tell it to start hiding
      messageQueue[i].visible = false;
      updateCurrent();

      setTimeout(() => showNext());
    } else messageQueue.splice(i, 1);
    return;
  }
}

export function hide(idx) {
  for (let i = 0; i < messageQueue.length; i++) {
    if (idx != messageQueue[i].idx) continue;

    if (i == 0) {
      // tell it to start hiding
      messageQueue[i].visible = false;
      updateCurrent();

      setTimeout(() => showNext());
    } else messageQueue.splice(i, 1);
    return;
  }
}

// Manage

function displayCurrent() {
  var current = messageQueue[0];
  const waitTime = current.options.animation + current.options.duration;
  if (!current) return;

  switch (current.display) {
    case "toast":
      current.view = new RootSiblings(
        (
          <Toast {...current.options} visible={current.visible} message={current.message} />
        )
      );
      if(current.options.duration) setTimeout(showNext, waitTime);
      break;

    case "notification":
      current.view = new RootSiblings(
        (
          <Notification {...current.options} visible={current.visible} message={current.message} title={current.title} />
        )
      );
      if(current.options.duration) setTimeout(showNext, waitTime);
      break;

    case "loading":
      current.view = new RootSiblings(
        (
          <Loading {...current.options} visible={current.visible} message={current.message} title={current.title} />
        )
      );
      break;

    default:
      return;
  }
}

function updateCurrent() {
  var current = messageQueue[0];
  if (!current) return null;

  switch (current.display) {
    case "toast":
      current.view.update(
        <Toast {...current.options} visible={current.visible} message={current.message} />
      );
      break;

    case "notification":
      current.view.update(
        <Notification {...current.options} visible={current.visible} message={current.message} title={current.title} />
      );
      break;

    case "loading":
      current.view.update(
        <Loading {...current.options} visible={current.visible} message={current.message} title={current.title} />
      );
      break;

    default:
      return null;
  }
}

function showNext() {
  var current = messageQueue[0];
  if (current && current.view && current.view instanceof RootSiblings) {
    // tell it to start hiding
    current.visible = false;
    updateCurrent();

    // destroy after animation has hidden it
    setTimeout(() => current.view.destroy(), current.options.animation);
  }

  messageQueue.splice(0, 1);
  if (messageQueue.length) displayCurrent();
}
