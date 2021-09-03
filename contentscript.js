console.log("TheTestMart content script LOADED");


var PROJECT = "Finops";
var CUSTOMER = "TheTestMart";
var DEBUG_MODE = false,
    ACTIVE_STATE = undefined;
	
var currentElem = undefined;	



    function attributeValue(value) {
        if (value.indexOf("'") < 0) {
          return "'" + value + "'"
        } else if (value.indexOf('"') < 0) {
          return '"' + value + '"'
        } else {
          let result = 'concat('
          let part = ''
          let didReachEndOfValue = false
          while (!didReachEndOfValue) {
            let apos = value.indexOf("'")
            let quot = value.indexOf('"')
            if (apos < 0) {
              result += "'" + value + "'"
              didReachEndOfValue = true
              break
            } else if (quot < 0) {
              result += '"' + value + '"'
              didReachEndOfValue = true
              break
            } else if (quot < apos) {
              part = value.substring(0, apos)
              result += "'" + part + "'"
              value = value.substring(part.length)
            } else {
              part = value.substring(0, quot)
              result += '"' + part + '"'
              value = value.substring(part.length)
            }
            result += ','
          }
          result += ')'
          return result
        }
      }
      
      function xpathHtmlElement(name) {
        if (this.window.document.contentType == 'application/xhtml+xml') {
          // "x:" prefix is required when testing XHTML pages
          return 'x:' + name
        } else {
          return name
        }
      }
      
      function relativeXPathFromParent(current) {
        let index = this.getNodeNbr(current)
        let currentPath = '/' + this.xpathHtmlElement(current.nodeName)
        if (index > 0) {
          currentPath += '[' + (index + 1) + ']'
        }
        return currentPath
      }
      
      function getNodeNbr(current) {
        let childNodes = current.parentNode.childNodes
        let total = 0
        let index = -1
        for (let i = 0; i < childNodes.length; i++) {
          let child = childNodes[i]
          if (child.nodeName == current.nodeName) {
            if (child == current) {
              index = total
            }
            total++
          }
        }
        return index
      }
      
      function createXPathFromElement(elm) { 
        var allNodes = document.getElementsByTagName('*'); 
        for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
        { 
            if (elm.hasAttribute('id')) { 
                    var uniqueIdCount = 0; 
                    for (var n=0;n < allNodes.length;n++) { 
                        if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                        if (uniqueIdCount > 1) break; 
                    }; 
                    if ( uniqueIdCount == 1) { 
                        segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                        return segs.join('/'); 
                    } else { 
                        segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                    } 
            } else if (elm.hasAttribute('class')) { 
                segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
            } else { 
                for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                    if (sib.localName == elm.localName)  i++; }; 
                    segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
            }; 
        }; 
        return segs.length ? '/' + segs.join('/') : null; 
      }; 
      
      function findElement(path) { 
        var evaluator = new XPathEvaluator();
        if(path.startsWith("xpath=")){
          path = path.replace("xpath=","");
        } 
        var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
        return  result.singleNodeValue; 
      } 
      
      
      function preciseXPath(xpath, e) {
        //only create more precise xpath if needed
        if (this.findElement(xpath) != e) {
          let result = e.ownerDocument.evaluate(
            xpath,
            e.ownerDocument,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          )
          //skip first element (result:0 xpath index:1)
          for (let i = 0, len = result.snapshotLength; i < len; i++) {
            let newPath = 'xpath=(' + xpath + ')[' + (i + 1) + ']'
            if (this.findElement(newPath) == e) {
              return newPath
            }
          }
        }
        return 'xpath=' + xpath
      }
      
      function getFullName(e, loopCount) {
        var element = e;
        var document = element.ownerDocument;
        var eleName = "";
        var textElement = element;
        var count = 0;
        var eleType = "standard"
    
        if (element.getAttribute("data-dyn-savedtooltip") !== null && element.getAttribute("data-dyn-savedtooltip") != "") {
            var text = element.getAttribute("data-dyn-savedtooltip");
            eleName = text;
        }
    
    
        var sRole = "";
        if (eleName == "" && element.getAttribute("role") !== null && element.getAttribute("role") != "") {
            sRole = element.getAttribute("role");
        }
    
        if ((sRole == "switch") || (element.className == "toggle-box") || (element.className == "toggle-value")) {
            //data-dyn-role="CheckBox"
            var checkBox = element.closest('[data-dyn-role="CheckBox"]')
            var checkBoxName = checkBox.getElementsByClassName("staticText label checkBox-label").item(0)
            return checkBoxName.textContent + " radio"
    
    
    
            
            //var eleFor = document.querySelectorAll("[for='" + element.id + "']")[0];
    
            //eleName = eleFor.textContent.trim();
    
            //var coll = document.querySelectorAll('[role="switch"], .toggle-box, .toggle-value');
            //if (coll.length > 1) {
            //    var iCount = 0;
            //    for (var i = 0; i < coll.length; i++) {
            //        iCount++
            //        if (coll[i] == element) {
            //            eleName = eleName + "[" + iCount + "]";
            //            break;
            //        }
            //    }
           // }
    
            //eleName = eleName + "radio";
            //return eleName;
        }
    
    
    
        var sDataDynRole = "";
        if (eleName == "" && element.getAttribute("data-dyn-role") !== null && element.getAttribute("data-dyn-role") != "") {
            sDataDynRole = element.getAttribute("data-dyn-role");
        }
    
        console.log("checking menu")
        var parentAppBarSection = element.closest('[data-dyn-role = "AppBarSection"]');
        if (parentAppBarSection) {
            eleType = "menu"
            console.log("Element is menu item")
        }
    
        console.log("checking table")
        var parentAppBarSection = element.closest('[role="grid"]');
        columnHeaderEle = null
        if (parentAppBarSection) {
            var tables = document.querySelectorAll("[role='grid']")
            var columnHeaderEleTest1 = element.closest('[data-dyn-role="ColumnHeader"]');
            var columnHeaderEleTest2 = element.closest('[role="columnheader"]');
            if(columnHeaderEleTest2){
              columnHeaderEle = columnHeaderEleTest2
            }
            if(columnHeaderEleTest1){
              columnHeaderEle = columnHeaderEleTest1
            }
            if (columnHeaderEle) {
                eleType = "header"
                console.log("Element is header")
                eleName = columnHeaderEle.textContent
                count = 1
                tableNum = 0
                for (var i = 0; i < tables.length; i++) {
                    tableNum = tableNum + 1
                    if (tables[i] == parentAppBarSection) {
                        count = tableNum;
                    }
                }
                if(count == 1){
                    console.log(eleName + " header")
                    return eleName + " header"
                }else{
                    console.log(eleName +" ["  + count  + "] header")
                    return eleName +" ["  + count  + "] header"
                }
            }else{
                eleType = "row"
                console.log("Element is row") 
                colindex = element.closest("[data-colindex]")
                if(colindex){
                  colindexnum = 1
                  if (colindex.getAttribute("data-colindex") !== null && colindex.getAttribute("data-colindex") != "") {
                      colindexnum = colindex.getAttribute("data-colindex");
                  }
      
                  headerofEle = parentAppBarSection.querySelector('[data-colindex="'+colindexnum+'"][data-dyn-role="ColumnHeader"]')
                  eleName = headerofEle.textContent
                }else{
                  eleName = element.getAttribute("aria-label")
                }
                count = 1
                tableNum = 0
                for (var i = 0; i < tables.length; i++) {
                    tableNum = tableNum + 1
                    if (tables[i] == parentAppBarSection) {
                        count = tableNum;
                    }
                }
    
    
                if(count == 1){
                    console.log(eleName + " row")
                    return eleName + " row"
                }else{
                    console.log(eleName +" ["  + count  + "] row")
                    return eleName +" ["  + count  + "] row"
                }
            }
        }
        //table
        //role="grid"
    
        //column header
        //data-dyn-role="ColumnHeader"
    
    
    
    
        if (eleName == "" && element.getAttribute("aria-label") !== null && element.getAttribute("aria-label") != "") {
            var eleName = element.getAttribute("aria-label");
            var quickcount = 0
            try {
                var elems = document.querySelectorAll("[aria-label='" + eleName + "']");
                for (var i = 0; i < elems.length; i++) {
                    quickcount = quickcount + 1
                    if (elems[i] == element) {
                        count = quickcount;
                    }
                }
            } catch (err) {
                console.log(err)
            }
            if (element.getAttribute("data-colindex") !== null && element.getAttribute("data-colindex") != "") {
                eleName = eleName + " row"
            }
        }
        if (eleName == "" && element.id != "" && element.id != null && element.id !== undefined && document.querySelectorAll("[for='" + element.id + "']").length > 0) {
            var ele = document.querySelectorAll("[for='" + element.id + "']")[0];
            eleName = ele.textContent.trim();
            textElement = ele;
        }
        if (eleName == "" && element.getAttribute("aria-label") !== null && element.getAttribute("aria-label") != "") {
            var text = element.getAttribute("aria-label");
            eleName = text;
        } if (eleName == "" && element.getAttribute("aria-labelledby") !== null && element.getAttribute("aria-labelledby") != "") {
            var id_to_find = element.getAttribute("aria-labelledby");
            var ele = document.getElementById(id_to_find);
            eleName = ele.textContent.trim();
            textElement = ele;
        } if (eleName == "" && element.getAttribute("aria-describedby") !== null && element.getAttribute("aria-describedby") != "") {
            var id_to_find = element.getAttribute("aria-describedby");
            var ele = document.getElementById(id_to_find);
            eleName = ele.textContent.trim();
            textElement = ele;
        } if (eleName == "" && element.textContent != "") {
            var eleName = element.textContent.trim();
        }
        if (eleName == "" && element.getAttribute("data-dyn-title") !== null && element.getAttribute("data-dyn-title") != "") {
            var text = element.getAttribute("data-dyn-title");
            eleName = text;
        } if (eleName == "" && element.getAttribute("alt") !== null && element.getAttribute("alt") != "") {
            var text = element.getAttribute("alt");
            eleName = text;
        } if (eleName == "" && element.getAttribute("value") !== null && element.getAttribute("value") != "") {
            var text = element.getAttribute("value");
            eleName = text;
        } if (eleName == "" && element.getAttribute("title") !== null && element.getAttribute("title") != "") {
            var text = element.getAttribute("title");
            eleName = text;
        } if (eleName == "" && element.getAttribute("id") !== null && element.getAttribute("id") != "") {
            var text = element.getAttribute("id");
            eleName = text;
        } if (eleName == "") {
            eleName = "unnamed";
        }
    
        var elems = document.querySelectorAll("*")
        var arrayLength = elems.length;
    
        if (eleName != "unnamed" && count > 1) {
            eleName = eleName + "[" + count + "]";
        }
    
        function isDescendant(parent, child) {
            var node = child.parentNode;
            while (node != null) {
                if (node == parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
    
    
        if (eleName != "unnamed" && count == 0) {
            var visibleEles = [];
            for (var i = 0; i < arrayLength; i++) {
                if (elems[i].textContent == eleName) {
                    var rect = elems[i].getBoundingClientRect();
    
                    if (rect.top == 0 && rect.right == 0 && rect.bottom == 0 && rect.left == 0) {
                        //log element not visible?
                    }
                    else {
                        incCount = false
    
                        var parentAppBarSection = elems[i].closest('[data-dyn-role = "AppBarSection"]');
                        if(eleType == "menu"&&parentAppBarSection){
                          incCount = true
                        }
                        if(eleType != "menu"){
    
                          incCount = true
                          if(parentAppBarSection){
                            incCount = false
                          }
                        }
                        if (visibleEles.length > 0) {
                            var isDesc = false;
                            for (var j = 0; j < visibleEles.length; j++) {
                                if (isDescendant(visibleEles[j], elems[i])) {
                                    isDesc = true
                                }
                                if (isDescendant(elems[i], visibleEles[j])) {
                                    isDesc = true
                                }
                            }
                            if (!isDesc&&incCount) {
                                count = count + 1
                                visibleEles[visibleEles.length - 1] = elems[i]
                                console.log("recording element " + count);
                                console.log(rect.top, rect.right, rect.bottom, rect.left);
                                console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
                                console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
                                console.log(elems[i])
                            }
                        } else {
                            if(incCount){
                              console.log("recording element 1");
                              console.log(rect.top, rect.right, rect.bottom, rect.left);
                              console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
                              console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
                              console.log(elems[i])
                              visibleEles[0] = elems[i]
                              count = count + 1;
                            }
                        }
    
                        //console.log(rect.top, rect.right, rect.bottom, rect.left);
                        //console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
                        //console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
                        //console.log(elems[i])
                    }
                }
                if (count > 1 && elems[i] == textElement) {
                    if(eleType == "menu"){
                        eleName = eleName + " menu"
                    }
                    eleName = eleName + "[" + count + "]";
                }
                if (elems[i] == textElement) {
                    if(eleType == "menu"){
                        eleName = eleName + " menu"
                    }
                    break;
                }
            }
        }
        if (eleName == "unnamed") {
            if (loopCount < 6) {
                eleName = getFullName(e.parentNode, loopCount + 1)
            }
        }
        return eleName;
    }
      
      function xpathHrefid(e) {
        if (e.attributes && e.hasAttribute('id')) {
          var idValue = e.getAttribute('id')
          var splitID = idValue.split(/(\d+)/);
          var xpathReturn = `//${e.nodeName.toLowerCase()}`
          for(var i=0; i < splitID.length; i++){
            if(isNaN(splitID[i])){
              xpathReturn = xpathReturn + "[contains(@id, '" + splitID[i] + "')]"
            }
          }
          return this.preciseXPath(xpathReturn, e)
        }
        return null
      }
      
      function xpathLink(e) {
        if (e.nodeName == 'A') {
          let text = e.textContent
          if (!text.match(/^\s*$/)) {
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('a') +
                "[contains(text(),'" +
                text.replace(/^\s+/, '').replace(/\s+$/, '') +
                "')]",
              e
            )
          }
        }
        return null
      }
      
      function xpathImg(e) {
        if (e.nodeName == 'IMG') {
          if (e.alt != '') {
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('img') +
                '[@alt=' +
                this.attributeValue(e.alt) +
                ']',
              e
            )
          } else if (e.title != '') {
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('img') +
                '[@title=' +
                this.attributeValue(e.title) +
                ']',
              e
            )
          } else if (e.src != '') {
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('img') +
                '[contains(@src,' +
                this.attributeValue(e.src) +
                ')]',
              e
            )
          }
        }
        return null
      }
      
      function xpathAttr(e) {
        const PREFERRED_ATTRIBUTES = [
          'id',
          'name',
          'value',
          'type',
          'action',
          'onclick',
        ]
        let i = 0
      
        function attributesXPath(name, attNames, attributes) {
          let locator = '//' + this.xpathHtmlElement(name) + '['
          for (i = 0; i < attNames.length; i++) {
            if (i > 0) {
              locator += ' and '
            }
            let attName = attNames[i]
            locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
          }
          locator += ']'
          return this.preciseXPath(locator, e)
        }
      
        if (e.attributes) {
          let atts = e.attributes
          let attsMap = {}
          for (i = 0; i < atts.length; i++) {
            let att = atts[i]
            attsMap[att.name] = att.value
          }
          let names = []
          // try preferred attributes
          for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
            let name = PREFERRED_ATTRIBUTES[i]
            if (attsMap[name] != null) {
              names.push(name)
              let locator = attributesXPath.call(
                this,
                e.nodeName.toLowerCase(),
                names,
                attsMap
              )
              if (e == this.findElement(locator)) {
                return locator
              }
            }
          }
        }
        return null
      }
      
      function xpathAttr(e) {
        const PREFERRED_ATTRIBUTES = [
          'name',
          'value',
          'type',
          'action',
          'onclick',
        ]
        let i = 0
      
        function attributesXPath(name, attNames, attributes) {
          let locator = '//' + this.xpathHtmlElement(name) + '['
          for (i = 0; i < attNames.length; i++) {
            if (i > 0) {
              locator += ' and '
            }
            let attName = attNames[i]
            locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
          }
          locator += ']'
          return this.preciseXPath(locator, e)
        }
      
        if (e.attributes) {
          let atts = e.attributes
          let attsMap = {}
          for (i = 0; i < atts.length; i++) {
            let att = atts[i]
            attsMap[att.name] = att.value
          }
          let names = []
          // try preferred attributes
          for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
            let name = PREFERRED_ATTRIBUTES[i]
            if (attsMap[name] != null) {
              names.push(name)
              let locator = attributesXPath.call(
                this,
                e.nodeName.toLowerCase(),
                names,
                attsMap
              )
              if (e == this.findElement(locator)) {
                return locator
              }
            }
          }
        }
        return null
      }
      
      function xpathIdRelativePartial(e) {
        let path = ''
        let current = e
        while (current != null) {
          if (current.parentNode != null) {
            path = this.relativeXPathFromParent(current) + path
            if (
              1 == current.parentNode.nodeType && // ELEMENT_NODE
              current.parentNode.getAttribute('id')
            ) {
              var idValue = current.parentNode.getAttribute('id')
              var splitID = idValue.split(/(\d+)/);
              var xpathReturn = `//${current.parentNode.nodeName.toLowerCase()}`
              for(var i=0; i < splitID.length; i++){
                if(isNaN(splitID[i])){
                  xpathReturn = xpathReturn + "[contains(@id, '" + splitID[i] + "')]"
                }
              }
              return this.preciseXPath(xpathReturn +
                  path,
                e
              )
            }
          } else {
            return null
          }
          current = current.parentNode
        }
        return null
      }
      
      function xpathIdRelative(e) {
        let path = ''
        let current = e
        while (current != null) {
          if (current.parentNode != null) {
            path = this.relativeXPathFromParent(current) + path
            if (
              1 == current.parentNode.nodeType && // ELEMENT_NODE
              current.parentNode.getAttribute('id')
            ) {
              return this.preciseXPath(
                '//' +
                  this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase()) +
                  '[@id=' +
                  this.attributeValue(current.parentNode.getAttribute('id')) +
                  ']' +
                  path,
                e
              )
            }
          } else {
            return null
          }
          current = current.parentNode
        }
        return null
      }
      
      function xpathHref(e) {
        if (e.attributes && e.hasAttribute('href')) {
          let href = e.getAttribute('href')
          if (href.search(/^http?:\/\//) >= 0) {
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('a') +
                '[@href=' +
                this.attributeValue(href) +
                ']',
              e
            )
          } else {
            // use contains(), because in IE getAttribute("href") will return absolute path
            return this.preciseXPath(
              '//' +
                this.xpathHtmlElement('a') +
                '[contains(@href, ' +
                this.attributeValue(href) +
                ')]',
              e
            )
          }
        }
        return null
      }
      
      function xpathPosition(
        e,
        opt_contextNode
      ) {
        let path = ''
        let current = e
        while (current != null && current != opt_contextNode) {
          let currentPath
          if (current.parentNode != null) {
            currentPath = this.relativeXPathFromParent(current)
          } else {
            currentPath = '/' + this.xpathHtmlElement(current.nodeName)
          }
          path = currentPath + path
          let locator = '/' + path
          if (e == this.findElement(locator)) {
            return 'xpath=' + locator
          }
          current = current.parentNode
        }
        return null
      }
      
      function xpathInnerText(el) {
        if (el.innerText) {
          return `xpath=//${el.nodeName}[contains(.,'${el.innerText}')]`
        } else {
          return null
        }
      }

      

















// Add element border on mouse over
function DIOnMouseOver(evt)
{
    element = evt.target;   // not IE
    // set the border around the element
    element.style.outlineWidth = '2px';
    element.style.outlineStyle = 'double';
    element.style.outlineColor = 'orange';
	
	currentElem = evt.target;	
}

// Remove elements border on mouse out
function DIOnMouseOut(evt)
{
    evt.target.style.outlineStyle = 'none';
}

// Find all previous elements of the given element
function prev_all(elm, elm_xpath) {
    var elm_tag = '',
        bare_xpath = true,
        prev_list = [],
        iter_elm = null;

    if (elm === null) {
        if (DEBUG_MODE === true) {
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
            console.log('Element equals "null"');
            console.log(elm);
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
        }
        alert('Cannot build XPATH here');
        return false;
    }
    if (elm.tagName === undefined) {
        if (DEBUG_MODE === true) {
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
            console.log('Seems like element does not have tag name !');
            console.log(elm);
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
        }
        alert('Cannot build XPATH here');
        return false;
    }

    if (DEBUG_MODE === true) {
        console.log('-   -   -   -   -   -   -   -   -   -   -   -   -   -   -');
        console.log('All previous by tag of element:');
        console.log(elm);
    }

    elm_tag = elm.tagName.toLowerCase();
    bare_xpath = true;
    if (elm_xpath.indexOf('[') > -1) {
        bare_xpath = false;
    }
    iter_elm = elm.previousElementSibling;
    while (iter_elm !== null) {
        iter_elm_xpath = get_element_xpath(iter_elm, false, false);
        if (iter_elm_xpath === false) {
            return false;
        }
        if (bare_xpath === true && elm_tag === iter_elm.tagName.toLowerCase()) {
            prev_list.push(iter_elm);
        } else if (bare_xpath === false && iter_elm_xpath === elm_xpath) {
            prev_list.push(iter_elm);
        }
        iter_elm = iter_elm.previousElementSibling;
    }

    if (DEBUG_MODE === true) {
        console.log('is list of elements:');
        console.log(prev_list);
    }

    return prev_list;
}

// Build xpath for given element
function get_element_xpath(elm, set_index=true, debug=true) {
    var prev_list_length = 0,
        target_tag = null,
        cls = '',
        xpath = '',
        elm_id_found = false,
        elm_spec = [],
        cls_split = [],
        prev_list = [];

    if (elm.tagName === undefined) {
        if (DEBUG_MODE === true) {
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
            console.log('Seems like element does not have tag name !');
            console.log(elm);
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
        }
        alert('Cannot build XPATH here');
        return false;
    }
    target_tag = elm.tagName.toLowerCase()
    
    // Element ID
    if (elm.hasAttribute('id') && elm.id.trim() !== '') {
        elm_spec.push("@id='" + elm.id + "'");
        elm_id_found = true;
    } 

    // Element CLASS
    if (elm.hasAttribute('class') && elm.className.trim() !== '') {
        cls = elm.className.trim();
        if (cls.length > 0) {
            cls_split = cls.split(' ');
            if (cls_split[0].trim() !== '') {
                elm_spec.push("contains(@class, '" + cls_split[0].trim() + "')");
            }
        }
    }

    // Element NAME
    if (elm.hasAttribute('name') && elm.name.trim() !== '') {
        if (elm.name.indexOf("'") === -1 && elm.name.indexOf('"') === -1) {
            elm_spec.push("@name='" + elm.name + "'");
        }
    }

    // Build initial element XPATH
    xpath = '/' + target_tag;
    if (elm_spec.length > 0) {
        xpath += '[';
        xpath += elm_spec.join(' and ');
        xpath += ']';
    }
    if (elm_id_found) {
        xpath = '/' + xpath
    }

    // Set index of the xpath if it is for general xpath building not previous elements check
    // This way you are not comparing xpath strings with indexes
    if (set_index) {
        prev_list = prev_all(elm, xpath);
        if (prev_list === false) {
            return false;
        }
        prev_list_length = prev_list.length + 1;
        if (prev_list_length > 1) {
            xpath += '[' + prev_list_length + ']';
        }
    }

    return xpath;
}

function add_xpath_on_click(event){
  var e = event;
    e.stopPropagation();
    var target = null,
        elm = null,
        heading_found = false,
        xpath = '';

    if (DEBUG_MODE === true) {
        console.log('-   -   -   -   -   -   -   -   -   -   -   -   -   -   -');
        console.log('+   +   +   +   +   +   +   +   +   +   +   +   +   +   +');
    }
    e = e || window.event;
    e.preventDefault();
    target = e.target || e.srcElement;
    console.log(e.target);
  //console.log("HERE1")
  //console.log(createXPathFromElement(e.target))
  //console.log(getFullName(e.target, 0))
  //console.log(xpathHref(e.target))
  //console.log(xpathLink(e.target))
  //console.log(xpathImg(e.target))
  //console.log(xpathInnerText(e.target))
  //console.log(xpathPosition(e))
  //console.log(xpathHrefid(e.target))
  //console.log(xpathIdRelative(e.target))
  //console.log(xpathIdRelativePartial(e.target))
  //console.log(xpathAttr(e.target))
  

  var document = target.ownerDocument;
  console.log("title="+document.title);
  var title = document.title
  var url = document.URL
  var name = ""
  try{
    name = getFullName(target, 0)
  }catch(err){
    console.log(err)
  }
  name = window.prompt("Add element with name", name);
  var i = 0;
  var locators = "";
  var locator = xpathHref(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathLink(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathImg(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathHrefid(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathIdRelative(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathIdRelativePartial(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathAttr(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathInnerText(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathPosition(target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  let headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append('Origin','http://localhost:5000');
headers.append('Access-Control-Allow-Origin', '*');

locators = locators.replaceAll("xpath=","");

var formdata = new FormData();
formdata.append("pageTitle", title);
formdata.append("eleName", name);
formdata.append("locators", locators);
formdata.append("pageURL", url);



if(name!=null){
  chrome.extension.sendMessage({type: "get_customer"}, function(response) {
    console.log("*********")
    console.log(response)
    sCUSTOMER = response
  });
  chrome.extension.sendMessage({type: "get_project"}, function(response) {
    console.log("*********")
    console.log(response)
    sPROJECT = response
  });
  formdata.append("project", sPROJECT);
  formdata.append("customer", sCUSTOMER);
  var requestOptions = {
    mode: "no-cors",
    method: 'POST',
  body: formdata,
  redirect: 'follow',
  headers: headers
};
	chrome.extension.sendMessage({type: "get_server"}, function(sServer){
		console.log('sSever=' + sServer);
		//fetch("http://127.0.0.1:5000/element", requestOptions)
		fetch(sServer, requestOptions)
		.then(response => response.text())
		.then(result => console.log(result))
		.catch(error => console.log('error', error));		
	});
}
}

// Main function for building XPATH expression on 
function build_xpath_on_click(event) {
    var target = null,
        elm = null,
        heading_found = false,
        xpath = '';

    if (DEBUG_MODE === true) {
        console.log('-   -   -   -   -   -   -   -   -   -   -   -   -   -   -');
        console.log('+   +   +   +   +   +   +   +   +   +   +   +   +   +   +');
    }
    event = event || window.event;
    event.preventDefault();
    target = event.target || event.srcElement;
    xpath = get_element_xpath(target);
    chrome.extension.sendMessage({
        type: target
    });
    if (xpath === false) {
        return false;
    }
    if (xpath.substring(0, 2) === '/h') {
        if (['1', '2', '3', '4', '5', '6'].indexOf(xpath[2]) !== -1) {
            alert("XPATH builder: XPATH is ending with HTML heading tag. This might be problematic!");
        }
    }

    // If target element does not have ID
    if (xpath.substring(0, 2) !== '//') {
        elm = target;
        parents_loop:
            while (elm.parentNode) {
                elm = elm.parentNode;
                elm_xpath = get_element_xpath(elm);
                if (elm_xpath === false) {
                    return false;
                }
                if (elm_xpath.substring(0, 2) === '/h') {
                    if (['1', '2', '3', '4', '5', '6'].indexOf(elm_xpath[2]) !== -1) {
                        alert("XPATH builder: HTML heading tag '" + elm_xpath + "' is skipped!");
                        heading_found = true;
                    }
                }
                if (heading_found === false) {
                    xpath = elm_xpath + xpath;
                } else {
                    xpath = '/' + xpath;
                }
                if (DEBUG_MODE === true) {
                    console.log('Temporary xpath is: ' + xpath);
                }
                if (heading_found === true) {
                    heading_found = false;
                    continue;
                }
                // Check if somewhere ID is present in some of the parents
                if (elm_xpath.substring(0, 2) == '//' || elm_xpath.substring(0, 5) === '/html') {
                    break parents_loop;
                }
            }

        // Set relative path to the element if it is still absolute
        // Will go inside if it reached the root element
        if (xpath.substring(0, 2) !== '//' && xpath.substring(0, 5) !== '/html') {
            xpath = '/' + xpath;
        }
    }

    if (xpath === '') {
        if (DEBUG_MODE === true) {
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
            console.log('-   -   -   -   -   -   -   -   -   -   -   -   -   -   -');
            console.log('Cannot find XPATH for element!');
            console.log('Target:');
            console.log(target);
            console.log('Event:');
            console.log(event);
            console.log('##### ##### ##### ##### ##### ##### ##### #####');
        }
        alert('Cannot build XPATH here');
        return false;
    }
    console.log('Final XPATH is: ' + xpath);
    
    prompt("XPATH builder: Copy and use :)", xpath);
    if (jQuery) {  
        // jQuery is loaded  
        alert("Yeah!");
      } else {
        // jQuery is not loaded
        alert("Doesn't Work");
      }
}



// Toggle active and inactive states
function toggle_active_state() {
    if (ACTIVE_STATE === 'inactive') {
        if (DEBUG_MODE === true) {
            console.log('<<< Turn on XPATH Builder >>>');
        }
        ACTIVE_STATE = 'active';
        chrome.extension.sendMessage({
            type: "set_active"
        });
        //document.addEventListener('click', add_xpath_on_click);
        $('*').on('click', add_xpath_on_click);
        document.addEventListener("mouseover", DIOnMouseOver, true);
        document.addEventListener("mouseout", DIOnMouseOut, true);
    } else if (ACTIVE_STATE === 'active') {
        if (DEBUG_MODE === true) {
            console.log('<<< Turn off XPATH Builder >>>');
        }
        ACTIVE_STATE = 'inactive';
        chrome.extension.sendMessage({
            type: "set_inactive"
        });
        //document.removeEventListener('click', add_xpath_on_click);
        $('*').off('click', add_xpath_on_click);
        document.removeEventListener("mouseover", DIOnMouseOver, true);
        document.removeEventListener("mouseout", DIOnMouseOut, true);
		currentElem.style.outlineStyle = 'none';
    }
}


// Wait for message from background script to toggle active state or deactivate
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    console.log(msg.command)
    if (msg.command) {
        if (msg.command == 'toggle_active_state') {
            if (ACTIVE_STATE === undefined) {
                ACTIVE_STATE = 'inactive';
            }
            toggle_active_state();
            sendResponse('XPATH builder state is toggled');
        } else if (msg.command == 'set_inactive') {
            if (ACTIVE_STATE === 'active' || ACTIVE_STATE === undefined) {
                toggle_active_state();
                sendResponse('XPATH builder state is deactivated');
            }
        }
        else if (msg.command == 'jQuery_not_loaded') {
            console.log("JQUERY NOT LOADED PEPE")
        }
        else if (msg.command == 'jQuery_loaded') {
            console.log("JQUERY LOADED!")
        }
    }
});


// Set extension to inactive on initial window load
window.addEventListener("load", function() {
    chrome.extension.sendMessage({
        type: "set_inactive"
    });
}, true);
