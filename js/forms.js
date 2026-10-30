(function () {
  'use strict';

  function getUrlParam(name) {
    var searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name) || '';
  }

  function cleanMobile(value) {
    var raw = String(value || '').trim();
    var cleaned = raw.replace(/[^\d+]/g, '');
    if (cleaned.indexOf('+91') === 0) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.indexOf('91') === 0 && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    return cleaned.replace(/\D/g, '');
  }

  var restrictedWords = [
    // Adult / Sexual
    "porn", "porno", "xxx", "sex", "sexy", "sexual",
    "nude", "nudes", "naked", "nsfw", "erotic",
    "boobs", "boob", "tits", "titty", "milf",
    "hentai", "blowjob", "handjob", "orgasm",
    "masturbation", "masturbate", "cum", "semen",
    "sperm", "vagina", "penis", "pussy", "dildo",
    "prostitute", "prostitution", "escort", "hooker",
    "fuck", "fucking", "fucked", "fucker",
    "motherfucker", "dick", "dickhead", "cock",
    "cocksucker", "asshole", "bastard", "bitch",
    "whore", "slut", "rape", "rapist",

    // Additional English Bad Words
    "bullshitter", "bullshitting", "shithead",
    "shitface", "dipshit", "jackass", "dumbfuck",
    "fuckface", "fuckhead", "fucker", "fuckedup",
    "motherfucking", "clusterfuck", "shitbag",
    "scumbag", "dickwad", "dickweed", "twat",
    "tosser", "bellend", "wanker", "knobhead",
    "pisshead", "arsehole", "arsewipe",
    "douche", "douchebag", "dumbass",
    "asswipe", "asshat", "shitstorm",
    "crap", "crappy", "horseshit",
    "sonofabitch", "sonofawhore",
    "skank", "tramp", "freak", "pervert",
    "perverted", "sleazebag", "degenerate",
    "sucker", "loser", "scumbag",

    // Body Part Slang
    "breasts", "nipples", "testicles",
    "balls", "scrotum", "anus", "butthole",
    "buttock", "ass", "arse", "cockhead",
    "boobs", "dick", "penis", "vagina",

    // Abusive / Offensive
    "idiot", "moron", "retard", "imbecile",
    "stupid", "stupidity", "dumbass",
    "fool", "jackass", "bastard",
    "bitchy", "bitching", "dammit",
    "damn", "hell", "pissed", "prick",
    "jerk", "jerkoff", "pig", "coward",
    "worthless", "pathetic",

    // Indian / Hinglish Abusive Words
    "chutiya", "chutiye", "madarchod",
    "behenchod", "bhenchod", "bhosdike",
    "bhosdi", "gaand", "gandu", "gand",
    "lund", "lauda", "loda", "lavde",
    "lawde", "chodu", "chod", "randi",
    "randwa", "harami", "haraami",
    "kamina", "kamine", "suar", "kutte",
    "kutti", "saala", "saali",

    // Fake / Spam Names
    "test", "testing", "tester", "dummy",
    "asdf", "qwerty", "qwert", "unknown",
    "anonymous", "guest", "demo", "sample",
    "fake", "fakeuser", "temp", "temporary",
    "null", "undefined", "admin", "administrator",
    "hello", "hii", "hiii", "none", "no name",
    "yourname", "firstname", "lastname",

    // Random / Placeholder Values
    "abc", "abcd", "abcdef", "xyz",
    "aaaa", "bbbb", "xxxx", "zzzz",
    "123", "1234", "12345", "0000",
    "notavailable", "notapplicable",
    "na", "n/a", "nil", "nothing"
  ];

  function containsRestrictedWord(text) {
    if (!text) return false;
    var lower = String(text).toLowerCase().trim();
    // Normalize punctuation/spaces
    var cleanLower = lower.replace(/[^a-z0-9\s]/g, ' ');
    var words = cleanLower.split(/\s+/).filter(Boolean);

    for (var i = 0; i < restrictedWords.length; i++) {
      var rw = restrictedWords[i].toLowerCase();
      // Check full word match
      if (words.indexOf(rw) !== -1 || lower === rw) {
        return true;
      }
      // Check if restricted phrase is in lower text
      if (rw.indexOf(' ') !== -1 || rw.indexOf('/') !== -1) {
        if (lower.indexOf(rw) !== -1) {
          return true;
        }
      }
      // For short keywords (>= 3 chars) or strong bad words, check substring if needed
      if (rw.length >= 4 && cleanLower.indexOf(rw) !== -1) {
        return true;
      }
    }
    return false;
  }

  function validateFullName(name) {
    var trimmed = String(name || '').trim();
    if (!trimmed) {
      return { valid: false, message: 'Please enter your full name.' };
    }
    if (trimmed.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters.' };
    }
    if (trimmed.length > 60) {
      return { valid: false, message: 'Name must not exceed 60 characters.' };
    }
    if (/^\d+$/.test(trimmed)) {
      return { valid: false, message: 'Name cannot contain only numbers.' };
    }
    var nameRegex = /^[\p{Script=Latin}\p{Script=Devanagari}]+(?:[ '\u2019-][\p{Script=Latin}\p{Script=Devanagari}]+)*$/u;
    if (!nameRegex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid name using letters.' };
    }
    if (containsRestrictedWord(trimmed)) {
      return { valid: false, message: 'Please enter a valid, authentic name.' };
    }
    return { valid: true, value: trimmed };
  }

  function validateMobile(phone) {
    var trimmed = String(phone || '').trim();
    if (!trimmed) {
      return { valid: false, message: 'Please enter your mobile number.' };
    }
    var cleaned = cleanMobile(trimmed);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return { valid: false, message: 'Please enter a valid 10-digit Indian mobile number.' };
    }
    return { valid: true, value: cleaned };
  }

  function validateEmail(email, isRequired) {
    var trimmed = String(email || '').trim();
    if (!trimmed) {
      if (isRequired) {
        return { valid: false, message: 'Please enter your email address.' };
      }
      return { valid: true, value: '' };
    }
    if (trimmed.length > 100) {
      return { valid: false, message: 'Email address is too long.' };
    }
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true, value: trimmed };
  }

  function getFieldContainer(input) {
    return input.closest('.field, .hero-enquiry-form label + input, .hero-field, .modal-field, div') || input.parentElement;
  }

  function clearInlineError(input) {
    input.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    var container = getFieldContainer(input);
    if (container) {
      var err = container.querySelector('.field-error-msg');
      if (err) {
        err.remove();
      }
    }
  }

  function showInlineError(input, message) {
    input.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    var container = getFieldContainer(input);
    if (container) {
      var existing = container.querySelector('.field-error-msg');
      if (existing) {
        existing.textContent = message;
      } else {
        var err = document.createElement('div');
        err.className = 'field-error-msg';
        err.style.color = '#c82333';
        err.style.fontSize = '11px';
        err.style.marginTop = '4px';
        err.style.lineHeight = '1.3';
        err.textContent = message;
        input.insertAdjacentElement('afterend', err);
      }
    }
  }

  function getEndpoint(form) {
    if (form.hasAttribute('action')) {
      return form.action;
    }
    var pathname = window.location.pathname;
    if (pathname.indexOf('/wal-') !== -1 || pathname.indexOf('/our-project') !== -1 || pathname.indexOf('/thank-you') !== -1) {
      return '../mail.php';
    }
    return 'mail.php';
  }

  function initForm(form) {
    if (form.dataset.formBound === 'true') {
      return;
    }
    form.dataset.formBound = 'true';

    var nameInput = form.querySelector('input[name="name"], input[autocomplete="name"]');
    var phoneInput = form.querySelector('input[name="phone"], input[name="mobile"], input[type="tel"]');
    var emailInput = form.querySelector('input[name="email"], input[type="email"]');
    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"], .hero-submit, .btn');
    var statusEl = form.querySelector('.form-status, [aria-live="polite"]');

    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status';
      statusEl.setAttribute('aria-live', 'polite');
      statusEl.style.fontSize = '12px';
      statusEl.style.marginTop = '10px';
      form.appendChild(statusEl);
    }

    [nameInput, phoneInput, emailInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', function () {
          clearInlineError(input);
          if (statusEl) {
            statusEl.textContent = '';
          }
        });
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var hasErrors = false;
      var firstInvalidInput = null;

      var nameVal = '';
      if (nameInput) {
        var nameResult = validateFullName(nameInput.value);
        if (!nameResult.valid) {
          showInlineError(nameInput, nameResult.message);
          hasErrors = true;
          if (!firstInvalidInput) firstInvalidInput = nameInput;
        } else {
          clearInlineError(nameInput);
          nameVal = nameResult.value;
        }
      }

      var phoneVal = '';
      if (phoneInput) {
        var phoneResult = validateMobile(phoneInput.value);
        if (!phoneResult.valid) {
          showInlineError(phoneInput, phoneResult.message);
          hasErrors = true;
          if (!firstInvalidInput) firstInvalidInput = phoneInput;
        } else {
          clearInlineError(phoneInput);
          phoneVal = phoneResult.value;
        }
      }

      var emailVal = '';
      if (emailInput) {
        var isEmailRequired = emailInput.hasAttribute('required');
        var emailResult = validateEmail(emailInput.value, isEmailRequired);
        if (!emailResult.valid) {
          showInlineError(emailInput, emailResult.message);
          hasErrors = true;
          if (!firstInvalidInput) firstInvalidInput = emailInput;
        } else {
          clearInlineError(emailInput);
          emailVal = emailResult.value;
        }
      }

      if (hasErrors) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        if (statusEl) {
          statusEl.style.color = '#c82333';
          statusEl.textContent = 'Please fill out all required fields correctly.';
        }
        return;
      }

      var defaultProject = 'WAL Projects Gurgaon';
      var pageHeading = document.querySelector('h1');
      if (pageHeading && pageHeading.textContent) {
        defaultProject = pageHeading.textContent.trim();
      }
      var projectField = form.querySelector('input[name="project"], select[name="project"]');
      var projectVal = form.dataset.project || (projectField ? projectField.value : defaultProject);

      var payload = {
        name: nameVal,
        phone: phoneVal,
        email: emailVal,
        project: projectVal,
        source: form.id || 'enquiry-form',
        page_url: window.location.href,
        utm_source: getUrlParam('utm_source'),
        utm_medium: getUrlParam('utm_medium'),
        utm_campaign: getUrlParam('utm_campaign'),
        utm_term: getUrlParam('utm_term'),
        utm_content: getUrlParam('utm_content')
      };

      var originalBtnText = submitBtn ? (submitBtn.innerHTML || submitBtn.value) : 'Enquire Now';
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = 'Submitting...';
        } else {
          submitBtn.innerHTML = 'Submitting...';
        }
      }

      if (statusEl) {
        statusEl.style.color = '#72685c';
        statusEl.textContent = 'Processing your enquiry...';
      }

      var targetEndpoint = getEndpoint(form);

      fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function (response) {
        return response.json().then(function (data) {
          return { status: response.status, ok: response.ok, data: data };
        }).catch(function () {
          return { status: response.status, ok: response.ok, data: null };
        });
      })
      .then(function (result) {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = originalBtnText;
          } else {
            submitBtn.innerHTML = originalBtnText;
          }
        }

        if (result.ok && result.data && result.data.success) {
          form.reset();
          isLeadSubmitted = true;
          if (autoPopupTimer) {
            clearTimeout(autoPopupTimer);
            autoPopupTimer = null;
          }
          if (statusEl) {
            statusEl.style.color = '#155724';
            statusEl.style.backgroundColor = '#d4edda';
            statusEl.style.border = '1px solid #c3e6cb';
            statusEl.style.padding = '10px 14px';
            statusEl.style.borderRadius = '8px';
            statusEl.textContent = result.data.message || 'Thank you! Your enquiry has been submitted successfully.';
          }

          var modal = form.closest('.modal, #lead-modal, #modalOverlay');
          if (modal) {
            setTimeout(function () {
              closeModal(modal, false);
              if (statusEl) {
                statusEl.textContent = '';
                statusEl.style.display = 'none';
              }
            }, 3000);
          }
        } else {
          var errorMsg = (result.data && result.data.message) ? result.data.message : 'Submission failed. Please check your details and try again.';
          if (statusEl) {
            statusEl.style.color = '#721c24';
            statusEl.style.backgroundColor = '#f8d7da';
            statusEl.style.border = '1px solid #f5c6cb';
            statusEl.style.padding = '10px 14px';
            statusEl.style.borderRadius = '8px';
            statusEl.textContent = errorMsg;
          }
          if (result.data && result.data.errors) {
            Object.keys(result.data.errors).forEach(function (fieldKey) {
              var input = form.querySelector('input[name="' + fieldKey + '"]');
              if (input) {
                showInlineError(input, result.data.errors[fieldKey]);
              }
            });
          }
        }
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = originalBtnText;
          } else {
            submitBtn.innerHTML = originalBtnText;
          }
        }
        if (statusEl) {
          statusEl.style.color = '#721c24';
          statusEl.style.backgroundColor = '#f8d7da';
          statusEl.style.border = '1px solid #f5c6cb';
          statusEl.style.padding = '10px 14px';
          statusEl.style.borderRadius = '8px';
          statusEl.textContent = 'Network error. Please check your connection or contact us directly.';
        }
      });
    });
  }

  var autoPopupTimer = null;
  var isLeadSubmitted = false;

  function openModal(modal) {
    if (!modal || isLeadSubmitted) return;
    if (autoPopupTimer) {
      clearTimeout(autoPopupTimer);
      autoPopupTimer = null;
    }
    if (modal.classList.contains('active') || modal.classList.contains('open')) {
      return;
    }
    modal.classList.remove('closing');
    modal.classList.add('active');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    var firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) {
      setTimeout(function () {
        try {
          firstInput.focus();
        } catch (e) {}
      }, 150);
    }
  }

  function closeModal(modal, shouldScheduleNext) {
    if (!modal) return;
    if (modal.classList.contains('closing')) return;

    modal.classList.add('closing');
    document.body.style.overflow = '';

    setTimeout(function () {
      modal.classList.remove('active');
      modal.classList.remove('open');
      modal.classList.remove('closing');

      if (shouldScheduleNext !== false && !isLeadSubmitted) {
        scheduleAutoPopup(30000); // Popup again in 30 seconds
      }
    }, 220);
  }

  function scheduleAutoPopup(delayMs) {
    if (isLeadSubmitted) return;
    if (autoPopupTimer) {
      clearTimeout(autoPopupTimer);
      autoPopupTimer = null;
    }
    autoPopupTimer = setTimeout(function () {
      var targetModal = document.getElementById('lead-modal') || document.getElementById('modalOverlay') || document.querySelector('.modal');
      if (targetModal && !isLeadSubmitted) {
        openModal(targetModal);
      }
    }, delayMs);
  }

  function setupModals() {
    var modals = document.querySelectorAll('.modal, #lead-modal, #modalOverlay');
    var openTriggers = document.querySelectorAll('[data-enquire], .open-lead, .js-open-modal, a[href="#contact-modal"], .open-modal');

    openTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        var href = trigger.getAttribute('href');
        if (href && href.indexOf('#contact') === 0 && !document.getElementById('lead-modal') && !document.getElementById('modalOverlay')) {
          return;
        }
        event.preventDefault();

        var targetModal = document.getElementById('lead-modal') || document.getElementById('modalOverlay') || document.querySelector('.modal');
        if (targetModal) {
          var projectAttr = trigger.getAttribute('data-project');
          if (projectAttr) {
            var modalProjectInput = targetModal.querySelector('input[name="project"]');
            if (modalProjectInput) {
              modalProjectInput.value = projectAttr;
            }
          }
          openModal(targetModal);
        }
      });
    });

    modals.forEach(function (modal) {
      var closeBtns = modal.querySelectorAll('.close, #close-modal, #modalClose, .modal-close');
      closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeModal(modal, true);
        });
      });

      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal(modal, true);
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        modals.forEach(function (modal) {
          if (modal.classList.contains('active') || modal.classList.contains('open')) {
            closeModal(modal, true);
          }
        });
      }
    });
  }

  function init() {
    var forms = document.querySelectorAll('form.lead-form, form#heroForm, form#mainContactForm, form#popupForm, form#projectCtaForm, .hero-enquiry-form, .contact-form form');
    forms.forEach(initForm);
    setupModals();
    scheduleAutoPopup(15000); // 15 seconds after page load
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
