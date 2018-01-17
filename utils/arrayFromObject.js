//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

export default function arrayFromObject(object) {
  let images = [];
  Object.keys(object).map((key) => {
    let item = object[key]

    if (typeof item === 'object') {
      images = images.concat(arrayFromObject(item))
    } else {
      images.push(item);
    }
  });
  return  images;
}
