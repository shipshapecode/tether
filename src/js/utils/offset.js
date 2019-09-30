import { isString, isUndefined } from './type-check';

const MIRROR_LR = {
  center: 'center',
  left: 'right',
  right: 'left'
};

const MIRROR_TB = {
  middle: 'middle',
  top: 'bottom',
  bottom: 'top'
};

const OFFSET_MAP = {
  top: 0,
  left: 0,
  middle: '50%',
  center: '50%',
  bottom: '100%',
  right: '100%'
};

export function addOffset(...offsets) {
  const out = { top: 0, left: 0 };

  offsets.forEach(({ top, left }) => {
    if (isString(top)) {
      top = parseFloat(top);
    }
    if (isString(left)) {
      left = parseFloat(left);
    }

    out.top += top;
    out.left += left;
  });

  return out;
}

export function attachmentToOffset(attachment) {
  let { left, top } = attachment;

  if (!isUndefined(OFFSET_MAP[attachment.left])) {
    left = OFFSET_MAP[attachment.left];
  }

  if (!isUndefined(OFFSET_MAP[attachment.top])) {
    top = OFFSET_MAP[attachment.top];
  }

  return { left, top };
}

export function autoToFixedAttachment(attachment, relativeToAttachment) {
  let { left, top } = attachment;

  if (left === 'auto') {
    left = MIRROR_LR[relativeToAttachment.left];
  }

  if (top === 'auto') {
    top = MIRROR_TB[relativeToAttachment.top];
  }

  return { left, top };
}

export function offsetToPx(offset, size) {
  if (isString(offset.left) && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left) / 100 * size.width;
  }
  if (isString(offset.top) && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top) / 100 * size.height;
  }

  return offset;
}

export function parseTopLeft(value) {
  const [top, left] = value.split(' ');
  return { top, left };
}
