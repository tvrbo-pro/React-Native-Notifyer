import React from "react";
import RootSiblings from "react-native-root-siblings";

import Notification from "./lib/notification";

var messageQueue = [];
var defaults = {
  duration: 5500,
  animation: 250
};

// Public functions

export function show(display = "toast", message, title, options = {}) {
  if (["toast", "notification", "loading"].indexOf(display) < 0)
    throw new Error("Invalid display type");
  else if (typeof message != "string")
    throw new Error("The message must be a string");
  else if (title && typeof title != "string")
    throw new Error("The title must be a string or null");
  else if (options && typeof options != "object")
    throw new Error("The options must be a string or null");

  options = Object.assign({}, defaults, options);

  const idx = Date.now();
  messageQueue.push({
    idx,
    visible: true,
    display,
    message,
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
  if (typeof options == "undefined" && typeof title == "object")
    options = title;
  return show("notification", message, title, options); // return idx
}

export function showLoading(message, title, options) {
  if (typeof options == "undefined" && typeof title == "object")
    options = title;
  return show("loading", message, title, options); // return idx
}

export function hideLoading() {
  for (let i = 0; i < messageQueue.length; i++) {
    if ("loading" == messageQueue[i].display) continue;

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
          <Notification {...current.options} visible={current.visible}>
            {current.message}
          </Notification>
        )
      );
      if(current.options.duration) setTimeout(showNext, waitTime);
      break;

    case "notification":
      current.view = new RootSiblings(
        (
          <Notification {...current.options} visible={current.visible}>
            {current.message}
          </Notification>
        )
      );
      if(current.options.duration) setTimeout(showNext, waitTime);
      break;

    case "loading":
      current.view = new RootSiblings(
        (
          <Notification {...current.options} visible={current.visible}>
            {current.message}
          </Notification>
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
        <Notification {...current.options} visible={current.visible}>
          {current.message}
        </Notification>
      );

    case "notification":
      current.view.update(
        <Notification {...current.options} visible={current.visible}>
          {current.message}
        </Notification>
      );

    case "loading":
      current.view.update(
        <Notification {...current.options} visible={current.visible}>
          {current.message}
        </Notification>
      );

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
