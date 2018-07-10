/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

/*
 * t = current time (frames or milliseconds)
 * b = start value
 * c = change in value
 * d = duration (frames or milliseconds)
 */

// simple linear tweening - no easing, no acceleration
export const Linear = function(t, b, c, d) {
  return (c * t) / d + b;
};

// quadratic easing in - accelerating from zero velocity
export const EaseInQuad = function(t, b, c, d) {
  t /= d;
  return c * t * t + b;
};

// quadratic easing out - decelerating to zero velocity
export const EaseOutQuad = function(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
};

// quadratic easing in/out - acceleration until halfway, then deceleration
export const EaseInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

// cubic easing in - accelerating from zero velocity
export const EaseInCubic = function(t, b, c, d) {
  t /= d;
  return c * t * t * t + b;
};

// cubic easing out - decelerating to zero velocity
export const EaseOutCubic = function(t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
};

// cubic easing in/out - acceleration until halfway, then deceleration
export const EaseInOutCubic = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t + b;
  t -= 2;
  return (c / 2) * (t * t * t + 2) + b;
};

// quartic easing in - accelerating from zero velocity
export const EaseInQuart = function(t, b, c, d) {
  t /= d;
  return c * t * t * t * t + b;
};

// quartic easing out - decelerating to zero velocity
export const EaseOutQuart = function(t, b, c, d) {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
};

// quartic easing in/out - acceleration until halfway, then deceleration
export const EaseInOutQuart = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t * t + b;
  t -= 2;
  return (-c / 2) * (t * t * t * t - 2) + b;
};

// quintic easing in - accelerating from zero velocity
export const EaseInQuint = function(t, b, c, d) {
  t /= d;
  return c * t * t * t * t * t + b;
};

// quintic easing out - decelerating to zero velocity
export const EaseOutQuint = function(t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t * t * t + 1) + b;
};

// quintic easing in/out - acceleration until halfway, then deceleration
export const EaseInOutQuint = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t * t * t + b;
  t -= 2;
  return (c / 2) * (t * t * t * t * t + 2) + b;
};

// // sinusoidal easing in - accelerating from zero velocity
export const EaseInSine = function(t, b, c, d) {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
};

// // sinusoidal easing out - decelerating to zero velocity
export const EaseOutSine = function(t, b, c, d) {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

// sinusoidal easing in/out - accelerating until halfway, then decelerating
export const EaseInOutSine = function(t, b, c, d) {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};

// exponential easing in - accelerating from zero velocity
export const EaseInExpo = function(t, b, c, d) {
  return c * Math.pow(2, 10 * (t / d - 1)) + b;
};

// exponential easing out - decelerating to zero velocity
export const EaseOutExpo = function(t, b, c, d) {
  return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
};

// exponential easing in/out - accelerating until halfway, then decelerating
export const EaseInOutExpo = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  t--;
  return (c / 2) * (-Math.pow(2, -10 * t) + 2) + b;
};

// circular easing in - accelerating from zero velocity
export const EaseInCirc = function(t, b, c, d) {
  t /= d;
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
};

// circular easing out - decelerating to zero velocity
export const EaseOutCirc = function(t, b, c, d) {
  t /= d;
  t--;
  return c * Math.sqrt(1 - t * t) + b;
};

// circular easing in/out - acceleration until halfway, then deceleration
export const EaseInOutCirc = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
  t -= 2;
  return (c / 2) * (Math.sqrt(1 - t * t) + 1) + b;
};

export const EaseInElastic = function(t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t == 0) return b;
  if ((t /= d) == 1) return b + c;
  if (!p) p = d * 0.3;
  if (a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
  return (
    -(
      a *
      Math.pow(2, 10 * (t -= 1)) *
      Math.sin(((t * d - s) * (2 * Math.PI)) / p)
    ) + b
  );
};

export const EaseOutElastic = function(t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t == 0) return b;
  if ((t /= d) == 1) return b + c;
  if (!p) p = d * 0.3;
  if (a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
  return (
    a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
    c +
    b
  );
};

export const EaseInOutElastic = function(t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t == 0) return b;
  if ((t /= d / 2) == 2) return b + c;
  if (!p) p = d * (0.3 * 1.5);
  if (a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
  if (t < 1)
    return (
      -0.5 *
        (a *
          Math.pow(2, 10 * (t -= 1)) *
          Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
      b
    );
  return (
    a *
      Math.pow(2, -10 * (t -= 1)) *
      Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
      0.5 +
    c +
    b
  );
};

export const EaseInBack = function(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c * (t /= d) * t * ((s + 1) * t - s) + b;
};

export const EaseOutBack = function(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};

export const EaseInOutBack = function(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  if ((t /= d / 2) < 1)
    return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
  return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
};

export const EaseInBounce = function(t, b, c, d) {
  return c - EaseOutBounce(d - t, 0, c, d) + b;
};

export const EaseOutBounce = function(t, b, c, d) {
  if ((t /= d) < 1 / 2.75) {
    return c * (7.5625 * t * t) + b;
  } else if (t < 2 / 2.75) {
    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
  } else if (t < 2.5 / 2.75) {
    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
  } else {
    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
  }
};

export const EaseInOutBounce = function(t, b, c, d) {
  if (t < d / 2) return EaseInBounce(t * 2, 0, c, d) * 0.5 + b;
  return EaseOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
};
