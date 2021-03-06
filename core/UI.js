﻿var isInterceptionWorking = false;

document.addEventListener('isInterceptionWorking', function(e) {
   isInterceptionWorking = e.detail;
});

if (document.querySelector(".app-wrapper > .app") != undefined)
{
	setTimeout(function () { onMainUIReady(); }, 100);
}
else
{
	var appElem = document.getElementById("app");
	var DROPDOWN_CLASS = "_2imug";
	var OUTER_DROPDOWN_CLASS = "_1RQfk";
	var CHAT_PANEL_CLASS = "_1GX8_";
	
	if (appElem != undefined)
	{
		var mutationObserver = new MutationObserver(function (mutations)
		{
			var found = false;
			for (var i = 0; i < mutations.length; i++)
			{
				var addedNodes = mutations[i].addedNodes;
				for (var j = 0; j < addedNodes.length; j++)
				{
					var addedNode = addedNodes[j];
					if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains("app"))
					{
						setTimeout(function () { onMainUIReady(); }, 100);
						found = true;
						break;
					}
					else if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains(OUTER_DROPDOWN_CLASS))
					{
						setTimeout(function() 
						{
							document.dispatchEvent(new CustomEvent('onDropdownOpened', {}));
							
						},200);
					}
					else if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains(CHAT_PANEL_CLASS))
					{
						document.dispatchEvent(new CustomEvent('onPaneChatOpened', {}));
					}
				}
				if (found) break;
			}
		});
		mutationObserver.observe(appElem, { childList: true, subtree: true });
	}
}

function onMainUIReady() 
{
	document.dispatchEvent(new CustomEvent('onMainUIReady', {}));

	setTimeout(checkInterception, 1000);
	addIconIfNeeded();
	
	// if the menu itme is gone somehow after a short period of time (e.g because the layout changes from right-to-left) add it again
    setTimeout(addIconIfNeeded, 500);
    setTimeout(addIconIfNeeded, 1000);
}

var MENU_ITEM_CLASS = "rAUz7";
var CHEKBOX_PADDIG_CLASS = "_1YO_g";
var CHECKBOX_CONTAINER_CLASS = "";
var RECTANGLE_CLASS = "_3I_df";
var GREEN_BACKGROUND_CLASS = "_1VD7W";
var CHECKBOX_CHECKED_CLASS = "me9CP "  + GREEN_BACKGROUND_CLASS;
var CHECKBOX_UNCHECKED_CLASS = "me9CP";
var TICKED_CLASS = "_1KfC8 _1s8CA";
var UNTICKED_CLASS = "_1KfC8 _2uQfJ";

function addIconIfNeeded() 
{
	if (document.getElementsByClassName("menu-item-incognito").length > 0) return; // already added
	
	var firstMenuItem = document.getElementsByClassName(MENU_ITEM_CLASS)[0];
	if (firstMenuItem != undefined)
	{
		var menuItemElem = document.createElement("div");
		menuItemElem.setAttribute("class", MENU_ITEM_CLASS + " menu-item-incognito");
		var iconElem = document.createElement("button");
		iconElem.setAttribute("class", "icon icon-incognito");
		iconElem.setAttribute("title", "Incognito options");
		menuItemElem.appendChild(iconElem);
		firstMenuItem.parentElement.insertBefore(menuItemElem, firstMenuItem);
		
		chrome.runtime.sendMessage({ name: "getOptions" }, function (options) 
		{
			document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
			{
				detail: JSON.stringify(options)
			}));
	
			var dropContent = " \
					<div class='incognito-options-container' dir='ltr'> \
						<div class='incognito-options-title'>Incognito options</div> \
																					\
																					\
						<div class='incognito-options-item'> \
							<div id='incognito-option-read-confirmations' style='cursor: pointer !important; margin-bottom: 10px'> \
								<div class='checkbox-container " + CHECKBOX_CONTAINER_CLASS + "' style='display:inline !important;'> \
									<div class='checkbox checkbox-incognito " + (options.readConfirmationsHook ? "checked " + RECTANGLE_CLASS +  " " + CHECKBOX_CHECKED_CLASS + "'> <div class='checkmark " + TICKED_CLASS + "'> </div>" :
									 "unchecked " + RECTANGLE_CLASS + " " + CHECKBOX_UNCHECKED_CLASS + "'> <div class='checkmark " + UNTICKED_CLASS + "'> </div>") + "\
									</div> \
								</div> \
								Don't send read confirmations \
								<div class='incognito-options-description'>Messages that their read confirmation was blocked will be<p> marked in red instead of green.</div> \
							</div> \
									\
									\
							<div id='incognito-safety-delay-option-panel' style='margin-left: 25px !important; margin-top: 15px; font-size: 12px;'> \
								Send after safety delay: <br> \
								<div style='margin-top: 10px'> \
									<div id='incognito-option-disable-safety-delay' style='display: inline-block;' > \
										<input id='incognito-radio-disable-safety-delay' type='radio' class='radio-input' "
										 + (options.safetyDelay <= 0 ? "checked" : "") + " /> \
										Never \
									</div> \
									<div id='incognito-option-enable-safety-delay' style='display: inline-block; margin-left: 20px;'> \
										<input id='incognito-radio-enable-safety-delay' type='radio' class='radio-input' name='example' " 
										+ (options.safetyDelay > 0 ? "checked" : "") + "/> \
										After <input id='incognito-option-safety-delay' type='number' class='seconds-incognito-input' min='1' max='30' \
										step='1' placeholder='5' " + (options.safetyDelay <= 0 ? "disabled" : "") + " " 
										+ (options.safetyDelay > 0 ? "value='" + options.safetyDelay + "'" : "") +"/> seconds \
									</div> \
								</div> \
							</div> \
						</div> \
								\
								\
						<div id='incognito-option-presence-updates' class='incognito-options-item' style='cursor: pointer;'> \
							<div class='checkbox-container " + CHECKBOX_CONTAINER_CLASS + "' style='display:inline !important'> \
									<div class='checkbox checkbox-incognito " + (options.presenceUpdatesHook ? "checked " + RECTANGLE_CLASS + " "  + CHECKBOX_CHECKED_CLASS + "'> <div class='checkmark " + TICKED_CLASS + "'> </div>" : 
									"unchecked " + RECTANGLE_CLASS + "'> <div class='checkmark " + UNTICKED_CLASS + "'> </div>") + "\
								</div> \
							</div> \
							Don't send \"Last Seen\" updates \
							<div class='incognito-options-description'>Blocks outgoing presence updates.</div> \
						</div> \
					</div>";
						
			var drop = new Drop(
			{
				target: menuItemElem,
				content: dropContent,
				position: "bottom left",
				classes: "drop-theme-incognito",
				openOn: "click",
				tetherOptions: 
				{
					offset: "-4px -4px 0 0"
				},
			});
			var originalCloseFunction = drop.close;
			drop.close = function()
			{
				document.dispatchEvent(new CustomEvent('onIncognitoOptionsClosed', {detail: null}));
				setTimeout(function() {originalCloseFunction.apply(drop, arguments); }, 100);
			}
			drop.on("open", function()
			{
				if (!checkInterception()) return;
				document.getElementsByClassName("menu-item-incognito")[0].setAttribute("class", MENU_ITEM_CLASS + " GPmgf active menu-item-incognito");

				document.getElementById("incognito-option-read-confirmations").addEventListener("click", onReadConfirmaionsTick);
				document.getElementById("incognito-option-presence-updates").addEventListener("click", onPresenseUpdatesTick);
				document.getElementById("incognito-option-safety-delay").addEventListener("input", onSafetyDelayChanged);
				document.getElementById("incognito-option-safety-delay").addEventListener("keypress", isNumberKey);
				document.getElementById("incognito-radio-enable-safety-delay").addEventListener("click", onSafetyDelayEnabled);
				document.getElementById("incognito-radio-disable-safety-delay").addEventListener("click", onSafetyDelayDisabled);
				
				document.dispatchEvent(new CustomEvent('onIncognitoOptionsOpened', {detail: null}));
			});
			drop.on("close", function()
			{
				document.getElementsByClassName("menu-item-incognito")[0].setAttribute("class", MENU_ITEM_CLASS + " menu-item-incognito");

				document.getElementById("incognito-option-read-confirmations").removeEventListener("click", onReadConfirmaionsTick);
				document.getElementById("incognito-option-presence-updates").removeEventListener("click", onPresenseUpdatesTick);
				document.getElementById("incognito-radio-enable-safety-delay").removeEventListener("click", onSafetyDelayEnabled);
				document.getElementById("incognito-radio-disable-safety-delay").removeEventListener("click", onSafetyDelayDisabled);
			});
		});
	}
}

document.addEventListener('onMarkAsReadClick', function(e) 
{
	var data = JSON.parse(e.detail);
	chrome.runtime.sendMessage({ name: "getOptions" }, function (options) 
	{
		if (options.readConfirmationsHook)
		{
			swal({
			  title: "Mark as read?",
			  text: data.formattedName + " will be able to tell you read the last " + (data.unreadCount > 1 ?  data.unreadCount + " messages." : " message."),
			  type: "warning",
			  showCancelButton: true,
			  confirmButtonColor: "#DD6B55",
			  confirmButtonText: "Yes, send receipt",
			  closeOnConfirm: true
			},
			function(){
			  document.dispatchEvent(new CustomEvent('sendReadConfirmation', {detail: JSON.stringify(data)}));
			  //swal("Sent!", "Messages were marked as read", "success");
			});
		}
	});
});

function onReadConfirmaionsTick()
{
	var readConfirmationsHook = false;
	var checkbox = document.querySelector("#incognito-option-read-confirmations .checkbox-incognito");
    var checkboxClass = checkbox.getAttribute("class");
	var checkmark = checkbox.firstElementChild;
	var chekmarkClass = checkmark.getAttribute("class");
    if (checkboxClass.indexOf("unchecked") > -1)
    {
        checkbox.setAttribute("class", checkboxClass.replace("unchecked", "checked") + GREEN_BACKGROUND_CLASS);
		checkmark.setAttribute("class", chekmarkClass.replace(UNTICKED_CLASS, TICKED_CLASS));
        readConfirmationsHook = true;
    }
    else
    {
        checkbox.setAttribute("class", checkboxClass.replace("checked", "unchecked").split(GREEN_BACKGROUND_CLASS).join(""));
		checkmark.setAttribute("class", chekmarkClass.replace(TICKED_CLASS, UNTICKED_CLASS));
        readConfirmationsHook = false;
		var redChats = document.getElementsByClassName("icon-meta unread-count incognito");
		for (var i=0;i<redChats.length;i++)
		{
			redChats[i].className = 'icon-meta unread-count';
		}
    }
    chrome.runtime.sendMessage({ name: "setOptions", readConfirmationsHook: readConfirmationsHook });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({readConfirmationsHook: readConfirmationsHook})
    }));
}

function onPresenseUpdatesTick()
{
	var presenceUpdatesHook = false;
	var checkbox = document.querySelector("#incognito-option-presence-updates .checkbox-incognito");
    var checkboxClass = checkbox.getAttribute("class");
	var checkmark = checkbox.firstElementChild;
	var chekmarkClass = checkmark.getAttribute("class");
    if (checkboxClass.indexOf("unchecked") > -1)
    {
        checkbox.setAttribute("class", checkboxClass.replace("unchecked", "checked") + GREEN_BACKGROUND_CLASS);
		checkmark.setAttribute("class", chekmarkClass.replace(UNTICKED_CLASS, TICKED_CLASS));
        presenceUpdatesHook = true;
    }
    else
    {
        checkbox.setAttribute("class", checkboxClass.replace("checked", "unchecked").split(GREEN_BACKGROUND_CLASS).join(""));
		checkmark.setAttribute("class", chekmarkClass.replace(TICKED_CLASS, UNTICKED_CLASS));
        presenceUpdatesHook = false;
    }
    chrome.runtime.sendMessage({ name: "setOptions", presenceUpdatesHook: presenceUpdatesHook });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({presenceUpdatesHook: presenceUpdatesHook})
    }));
}

function onSafetyDelayChanged(event)
{
	if (isSafetyDelayValid(event.srcElement.value))
	{
		var delay = parseInt(event.srcElement.value);
		document.getElementById("incognito-option-safety-delay").disabled = false;
		chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: delay });
		document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
		{
			detail: JSON.stringify({safetyDelay: delay})
		}));
	}
}

function onSafetyDelayDisabled()
{
	document.getElementById("incognito-option-safety-delay").disabled = true;
	document.getElementById("incognito-radio-enable-safety-delay").checked = false;
	chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: 0 });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({safetyDelay: 0})
    }));
}

function onSafetyDelayEnabled()
{
	var delay = parseInt(document.getElementById("incognito-option-safety-delay").value);
	if (isNaN(delay)) delay = parseInt(document.getElementById("incognito-option-safety-delay").placeholder)
	document.getElementById("incognito-option-safety-delay").disabled = false;
	document.getElementById("incognito-radio-disable-safety-delay").checked = false;
	chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: delay });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({safetyDelay: delay})
    }));
}

function isSafetyDelayValid(string)
{
    var number = Math.floor(Number(string));
    return (String(number) === string && number >= 1 && number <= 30) || string == ""
}

function checkInterception()
{
	if (!isInterceptionWorking)
	{
		sweetAlert("Oops...", "WhatsApp Web Incognito has detected that interception is not working. Please try refreshing this page, or, if the problem presists, writing back to the developer.", "error");
		return false;
	}
	
	return true;
}

function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}