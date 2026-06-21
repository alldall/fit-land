/* ===================================================================
   Логика лендинга: бургер-меню, кнопки «Подробнее»,
   маска телефона и валидация формы подбора программы.
   =================================================================== */
(function () {
  'use strict';

  /* --- Мобильное меню (бургер) ----------------------------------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('nav--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var opened = nav.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', String(opened));
      burger.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
    });
    // Закрываем меню после клика по пункту
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav__link')) closeNav();
    });
  }

  /* --- Галерея результатов: листание перетаскиванием мышью -------- */
  var track = document.querySelector('.gallery__track');
  if (track) {
    var isDown = false, startX = 0, startScroll = 0, moved = false;

    track.addEventListener('pointerdown', function (e) {
      // только основная кнопка мыши / тач / перо
      if (e.button !== undefined && e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('gallery__track--dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    function endDrag(e) {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('gallery__track--dragging');
      if (e && e.pointerId != null && track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // не выполнять клик/переход, если это было перетаскивание
    track.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    // отменяем нативный «призрак» перетаскивания картинки
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  var programSelect = document.getElementById('program');

  /* --- Форма: маска телефона + валидация -------------------------- */
  var form = document.getElementById('lead-form');
  if (!form) return;

  var phone = document.getElementById('phone');
  var success = document.getElementById('form-success');

  /* Маска вида +7 (999) 123-45-67 */
  function formatPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  phone.addEventListener('input', function () {
    phone.value = formatPhone(phone.value);
    clearError(phone);
  });
  phone.addEventListener('focus', function () {
    if (!phone.value) phone.value = '+7 ';
  });

  /* Управление сообщениями об ошибках */
  function setError(field, message) {
    field.classList.add('form__input--invalid');
    var box = form.querySelector('[data-error-for="' + field.id + '"]');
    if (box) box.textContent = message;
  }
  function clearError(field) {
    field.classList.remove('form__input--invalid');
    var box = form.querySelector('[data-error-for="' + field.id + '"]');
    if (box) box.textContent = '';
  }

  var nameField = document.getElementById('name');
  nameField.addEventListener('input', function () { clearError(nameField); });

  function validate() {
    var ok = true;

    if (nameField.value.trim().length < 2) {
      setError(nameField, 'Укажите имя — минимум 2 символа');
      ok = false;
    }

    var digits = phone.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      setError(phone, 'Введите номер полностью: +7 и 10 цифр');
      ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    success.hidden = true;

    if (!validate()) {
      var firstInvalid = form.querySelector('.form__input--invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* Демо-отправка: фронт самодостаточен, бэкенда нет.
       Собираем данные и показываем подтверждение. */
    var data = {
      name: nameField.value.trim(),
      phone: phone.value,
      program: (programSelect && programSelect.value) || 'Поможем выбрать',
      channel: (form.querySelector('input[name="channel"]:checked') || {}).value || '—'
    };
    console.log('Заявка отправлена:', data);

    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();
