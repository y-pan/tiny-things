function maxNumber(...numbers) {
  let m = Number.NEGATIVE_INFINITY;
  for (let num of numbers) {
    if (typeof num === "number" && Number.isFinite(num)) {
      m = Math.max(m, num);
    }
  }
  return m;
}

function zeros(numRows, numCols) {
  return Array(numRows)
    .fill(0)
    .map((rv) =>
      Array(numCols)
        .fill(0)
        .map((cv) => 0)
    );
}

function gridClone(grid) {
  const clone = zeros(grid.length, grid[0].length);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      clone[r][c] = grid[r][c];
    }
  }
  return clone;
}

function fillGrid(grid, item) {
  for (let row of grid) {
    for (let c = 0; c < row.length; ++c) row[c] = item;
  }
}

function gridExpand(grid, desiredRows, desiredCols) {
  let R = grid.length;
  let C = grid[0].length;
  let largeGrid = zeros(desiredRows, desiredCols);

  let r0 = Math.floor((desiredRows - R) / 2);
  let c0 = Math.floor((desiredCols - C) / 2);
  for (let r = r0; r < r0 + grid.length; r++) {
    for (let c = c0; c < c0 + grid[0].length; c++) {
      largeGrid[r][c] = grid[r - r0][c - c0];
    }
  }
  return largeGrid;
}

function topMostRowHavingLife(grid, lifeDigit) {
  for (let r = 0; r < grid.length; ++r) {
    if (grid[r].includes(lifeDigit)) {
      return r;
    }
  }
  return -1;
}

function bottomMostRowHavingLife(grid, lifeDigit) {
  for (let r = grid.length - 1; r >= 0; --r) {
    if (grid[r].includes(lifeDigit)) {
      return r;
    }
  }
  return -1;
}

function leftMostColHavingLife(grid, lifeDigit) {
  for (let c = 0; c < grid[0].length; ++c) {
    for (let r = 0; r < grid.length; ++r) {
      if (grid[r][c] == lifeDigit) {
        return c;
      }
    }
  }
  return -1;
}

function rightMostColHavingLife(grid, lifeDigit) {
  for (let c = grid[0].length - 1; c >= 0; --c) {
    for (let r = 0; r < grid.length; ++r) {
      if (grid[r][c] == lifeDigit) {
        return c;
      }
    }
  }
  return -1;
}

function gridTrim(grid, lifeDigit) {
  if (!grid) return undefined;

  // trim out top/bottom empty rows, left/right empty cols
  let r1 = topMostRowHavingLife(grid, lifeDigit);
  let r2 = bottomMostRowHavingLife(grid, lifeDigit);
  let c1 = leftMostColHavingLife(grid, lifeDigit);
  let c2 = rightMostColHavingLife(grid, lifeDigit);

  if (r1 === -1) {
    // grid has no life
    return undefined;
  }

  const res = Array(r2 - r1 + 1)
    .fill(0)
    .map((_) => Array(c2 - c1 + 1).fill(0));

  for (let r = 0; r < res.length; ++r) {
    for (let c = 0; c < res[0].length; ++c) {
      res[r][c] = grid[r + r1][c + c1];
    }
  }

  return res;
}

function digitsArrayToCompactString(
  arrayOfZerosAndOnes,
  { lifeDigit, deathDigit, lifeSymbol, deathSymbol }
) {
  let counter = []; //example: [ ["0", 2], ["1", ]
  for (let num of arrayOfZerosAndOnes) {
    if (counter.length === 0 || counter[counter.length - 1][0] !== num) {
      counter.push([num, 1]);
    } else {
      counter[counter.length - 1][1] += 1;
    }
  }

  return counter
    .map(([num, count]) => {
      if (num === lifeDigit) {
        return `${lifeSymbol}${count}`;
      }
      return `${deathSymbol}${count}`;
    })
    .reduce((prev, curSymbolCountStr) => prev + curSymbolCountStr, "");
}

function compactStringToDigitsArray(
  str,
  { lifeDigit, deathDigit, lifeSymbol, deathSymbol }
) {
  // str like: '.5O3.2', <symbol><number><symbol><number>
  str = str ? str.trim() : "";
  if (!str) {
    return [];
  }
  let arr = [];
  let l = 0;
  const digits = "01234567890";

  for (let r = 0; r < str.length; r++) {
    if (l === r || digits.includes(str[r])) {
      continue;
    }

    // has symbol, now we see another symbol, collect current <symbol><number>, where l is at symbo
    let symbol = str[l];
    let num = Number.parseInt(str.substring(l + 1, r));
    if (Number.isNaN(num)) {
      console.error("Bad format: ", str);
      return [];
    }

    arr = arr.concat(
      Array(num).fill(symbol === lifeSymbol ? lifeDigit : deathDigit)
    );
    l = r;
  }

  let symbol = str[l];
  let num = Number.parseInt(str.substring(l + 1));
  if (!Number.isNaN(num)) {
    arr = arr.concat(
      Array(num).fill(symbol === lifeSymbol ? lifeDigit : deathDigit)
    );
  }
  return arr;
}

function gridToCompactString(grid, lifeConfig) {
  return grid
    .map((digitArray) => digitsArrayToCompactString(digitArray, lifeConfig))
    .join("_");
}

/**
 *
 * @param {string} str
 * @param { {lifeDigit, deathDigit, lifeSymbol, deathSymbol} } lifeConfig
 * @returns {number[][] | undefined} grid
 */
function compactStringToGrid(str, lifeConfig) {
  if (!str) {
    return undefined;
  }
  return str.split("_").map((s) => compactStringToDigitsArray(s, lifeConfig));
}

function xyposToIndex(canvasXOffset, canvasYOffset, cellW, cellH) {
  let c = Math.floor(canvasXOffset / cellW);
  let r = Math.floor(canvasYOffset / cellH);
  return { r, c };
}

function gridOfNewlineSeparatedSingleStr(
  newLineSeparatedSingleStr,
  lifeConfig
) {
  // More generations setting: https://conwaylife.com/ref/lexicon/lex_g.htm
  // OO..O
  // O...O
  // O..OO
  const grid = String(newLineSeparatedSingleStr)
    .split("\n")
    .map((rowStr) => rowStr.trim())
    .filter(Boolean)
    .map((rowStr) =>
      rowStr
        .split("")
        .map((c) =>
          c === lifeConfig.lifeSymbol
            ? lifeConfig.lifeDigit
            : lifeConfig.deathDigit
        )
    );

  for (let r = 0; r < grid.length; r++) {
    if (r - 1 >= 0 && grid[r].length != grid[r - 1].length) {
      alert("Input format is not recognized - inconsistent row size");
      return [[]];
    }
  }
  return grid;
}

function randomized(grid, threshold, lifeConfig) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      grid[r][c] =
        Math.random() >= threshold
          ? lifeConfig.lifeDigit
          : lifeConfig.deathDigit;
    }
  }
}

function sleep(millisec = 1000) {
  return new Promise((res, rej) => {
    setTimeout(() => res(), millisec);
  });
}

(function test() {
  const lifeConfig = {
    lifeDigit: 1,
    deathDigit: 0,
    lifeSymbol: "O",
    deathSymbol: ".",
  };
  const arr1 = [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0];
  const arr1Str = ".5O3.1O2.1O1.2";
  console.assert(arr1Str === digitsArrayToCompactString(arr1, lifeConfig));

  const arr1b = compactStringToDigitsArray(arr1Str, lifeConfig);
  for (let i = 0; i < arr1b.length; i++) {
    console.assert(arr1b[i] === arr1[i]);
  }

  const grid1 = [
    [1, 1, 0],
    [0, 1, 0],
  ];
  const grid1Str = "O2.1_.1O1.1";
  if (grid1Str !== gridToCompactString(grid1, lifeConfig))
    throw new Error("Test");
  const grid1b = compactStringToGrid(grid1Str, lifeConfig);
  for (let r = 0; r < grid1.length; r++) {
    for (let c = 0; c < grid1[0].length; c++) {
      console.assert(grid1b[r][c] === grid1[r][c]);
    }
  }

  console.assert(
    "[[1,0,0],[0,1,1],[0,1,1]]" ===
      JSON.stringify(
        gridTrim(
          [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          1
        )
      )
  );

  console.assert(
    Number.NEGATIVE_INFINITY === maxNumber(NaN, undefined, null, "1")
  );
  console.assert(-5.5 === maxNumber(NaN, undefined, -5.5, -7, null, "1"));
  console.assert(9 === maxNumber(1, 2, 3, 4, 5, 0, 9, 8, 7, 6, 9));

  const gridFromStr = gridOfNewlineSeparatedSingleStr(
    `
      OO..O
      O...O
      O..OO
      `,
    lifeConfig
  );
  console.assert(
    "[[1,1,0,0,1],[1,0,0,0,1],[1,0,0,1,1]]" === JSON.stringify(gridFromStr)
  );
})();
