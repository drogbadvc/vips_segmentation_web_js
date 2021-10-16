var blockExtraction = function () {
    var travel = function (node, callback) {
        if (node === null || node.tagName == 'SCRIPT') {
            return;
        }
        if (node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                travel(node.childNodes[i], callback);
            }
        }
        callback(node);
    };
    var inlineTags = ['a', 'i', 'span', 'abbr', 'img', 'strong', 'acronym', 'input', 'sub', 'b', 'kbd', 'sup', 'bdo', 'label', 'textarea', 'big', 'map', 'time', 'br', 'object', 'tt', 'button', 'q', 'var', 'cite', 'samp', 'code', 'script', 'dfn', 'select', 'em', 'small'];

    var initNode = function (node) {
        node.isTextNode = (node.nodeType === Node.TEXT_NODE);
        node.isValidNode = false;
        if (!node.isTextNode) {
            node.isValidNode = (node.clientHeight > 0 && node.clientWidth > 0);
        }
        node.isVirtualTextNode = node.isTextNode;
        if (node.isVirtualTextNode) {
            for (var i = 0; i < node.childNodes.length; i++) {
                if (!node.childNodes[i].isVirutalTextNode) {
                    node.isVirtualTextNode = false;
                }
            }
        }
        if (node.isTextNode) {
            node.isInlineNode = false;
            for (var tag in inlineTags)
                if (node.tagName == tag) {
                    node.isInlineNode = true;
                    break;
                }
            node.isLineBreakNode = !node.isInlineNode;
        } else {
            node.isInlineNode = true;
            node.isLineBreakNode = false;
        }
    };
    // 1:divide,0:not divide,-1: to be determined.
    var rule1 = function (node) {
        if (!node.isTextNode) {
            var hasValidChild = false;
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].isValidNode) hasValidChild = true;
            }
            if (!hasValidChild) return 0;
        }
        return -1;
    };
    var rule2 = function (node) {
        var theValidChild = null;
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].isValidNode) {
                if (theValidChild !== null) return -1;
                theValidChild = node.childNodes[i];
            }
        }
        if (theValidChild !== null && !theValidChild.isTextNode) return 0;
        return -1;
    };
    var rule3 = function (node) {
    };
    var rule4 = function (node) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (!node.childNodes[i].isVirtualTextNode)
                return -1;
        }
        return 0;
    };
    var rule5 = function (node) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].isLineBreakNode)
                return 1;
        }
        return -1;
    };
    var rule6 = function (node) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].tagName == 'HR')
                return 1;
        }
        return -1;
    };
    var rule7 = function (node) {
        if (!node.isValidNode) return -1;
        var sum = 0;
        for (var i = 0; i < node.childNodes.length; i++) {
            if (!node.childNodes[i].isValidNode) continue;
            sum += node.childNodes[i].clientWidth * node.childNodes[i].clientHeight;
        }
        if (sum > node.clientWidth * node.clientHeight) return 1;
        return -1;
    };
    var rule8 = function (node) {
        var color = null;
        if (typeof(node.style) != "undefined")
            color = node.style.backgroundColor;
        var result = -1;
        for (var i = 0; i < node.childNodes.length; i++) {
            if (typeof(node.childNodes[i].style) != "undefined")
                if (color != node.childNodes[i].style.backgroundColor) {
                    result = 1;
                    node.childNodes[i].isDivide = false;
                }
        }
        return result;
    };
    var threshold = 500000;
    var rule9 = function (node) {
        if (!node.isValidNode) return -1;
        var hasVirtualTextNode = false;
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].isVirtualTextNode) hasVirtualTextNode = true;
        }
        if (hasVirtualTextNode && node.clientWidth * node.clientHeight < threshold) return 0;
        return -1;
    };
    var rule10 = function (node) {
        if (!node.isValidNode) return -1;
        for (var i = 0; i < node.childNodes.length; i++) {
            if (!node.childNodes[i].isValidNode) continue;
            if (node.childNodes[i].clientWidth * node.childNodes[i].clientHeight > threshold) return 0;
        }
        return -1;
    };
    var rule11 = function (node) {
        if (node.previousSibling === null) return -1;
        if (!node.previousSibling.isDivide)
            return 0;
        return -1;
    };
    var rule12 = function (node) {
        return 1;
    };
    var rule13 = function (node) {
        return 0;
    };
    var ruleInline = [rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule9, rule10, rule12];
    var ruleTable = [rule1, rule2, rule3, rule8, rule10, rule13];
    var ruleTr = [rule1, rule2, rule3, rule7, rule8, rule10, rule13];
    var ruleTd = [rule1, rule2, rule3, rule4, rule9, rule10, rule11, rule13];
    var ruleP = [rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule9, rule10, rule12];
    var ruleOther = [rule1, rule2, rule3, rule4, rule6, rule7, rule9, rule10, rule12];
    var checkDivide = function (node) {
        if (typeof(node.isDivide) != 'undefined') {
            if (node.isDivide) return 1;
            return 0;
        }
        var checkRule = null;
        if (node.isInlineNode) checkRule = ruleInline;
        else if (node.tagName == 'TABLE') checkRule = ruleTable;
        else if (node.tagName == 'TR') checkRule = ruleTr;
        else if (node.tagName == 'TD') checkRule = ruleTd;
        else if (node.tagName == 'P') checkRule = ruleP;
        else checkRule = ruleOther;
        for (var i = 0; i < checkRule.length; i++) {
            var ret = checkRule[i](node);
            if (ret == -1) continue;
            return ret;
        }
        return -1;
    }
    var divideNode = function (node) {
        if (typeof(node.isDivide) != 'undefined') {
            if (!node.isDivide) return;
        }
        var ret = checkDivide(node);
        if (ret === 1) {
            node.isDivide = true;
            for (var i = 0; i < node.childNodes.length; i++) {
                divideNode(node.childNodes[i]);
            }
        } else node.isDivide = false;
    };
    var checkBlock = function (node) {
        if (node.tagName === 'SCRIPT') return false;
        return true;
    };
    var blockList = [];
    var gatherBlock = function (node) {
        if (node.isDivide === false) {
            if (checkBlock(node))
                blockList.push(node);
        } else {
            for (var i = 0; i < node.childNodes.length; i++) {
                gatherBlock(node.childNodes[i]);
            }
        }
    };
    var initBlocks = function (node) {
        delete node.isDivide;
        for (var i = 0; i < node.childNodes.length; i++) {
            initBlocks(node.childNodes[i]);
        }
    };
    var root = document.getElementsByTagName("body")[0];
    travel(root, initNode);
    var currentRound = 0;
    var currentBlock = [root];

    var getRandomColor = function () {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    while (currentRound < 5) {
        //console.log('In: ' + currentBlock.length);
        //console.log(currentBlock)
        for (var idx in currentBlock) {
            divideNode(currentBlock[idx]);
        }
        blockList.length = 0;
        for (var idx in currentBlock) {
            gatherBlock(currentBlock[idx]);
        }
        for (var idx in blockList) {
            initBlocks(blockList[idx]);
            blockList[idx].isDivide = true;
        }
        currentRound++;
        currentBlock = blockList.slice(0);

        var colors = ["blue", "red", "green", "black", "white", "pink"];
        var c = getRandomColor();
        for (var idx in currentBlock) {
            if (typeof(currentBlock[idx].style) != 'undefined') {
                currentBlock[idx].style.border = "solid 5px " + c;
                //console.log(currentBlock[idx])
            }
        }
    }
};

module.exports.blockExtraction = blockExtraction;