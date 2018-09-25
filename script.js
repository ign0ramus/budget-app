// Контроллер бюджета
const budgetController = (() => {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calculatePercentage(totalIncome) {
            if (totalIncome > 0){
                this.percentage = Math.round(this.value / totalIncome * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    const calculateTotal = (type) => {
        let sum = data.allItems[type].reduce((acc, cur) => acc + cur.value, 0);
        data.totals[type] = sum;
    };

    const data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };

    return {

        addItem(type, des, val) {
            let id = 0;
            let newItem;

            // Cоздает новый id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            // Cоздает новый объект в зависимости от типа "expense" или "income"
            if (type === 'expense') {
                newItem = new Expense(id, des, val);
            } else if (type === 'income') {
                newItem = new Income(id, des, val);
            }

            // Добавляет объект в массив expense или income
            data.allItems[type].push(newItem);

            return newItem;
        },
    
        deleteItem(type, id) {
            // Удаляет объект из массива expense или income
            const idsArray = data.allItems[type].map((element) => element.id);
            const index = idsArray.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget() {
            // Считает общий доход и расход
            calculateTotal('expense');
            calculateTotal('income');

            // Считает бюджет: доход - расход
            data.budget = data.totals.income - data.totals.expense;

            // Считает потраченный процент от дохода 
            if (data.totals.income > 1) {
                data.percentage = Math.round(data.totals.expense / data.totals.income * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage() {
            data.allItems.expense.forEach((element) => element.calculatePercentage(data.totals.income));

        },

        getPercentages() {
            const allPercentages = data.allItems.expense.map((element) => element.percentage);
            return allPercentages;
        },

        getBudget() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            };
        },
        lol() {
            return data.allItems;
        }
    };
})();

// User Interface контроллер 
const uiController = (() => {

    const domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        deleteBtn: '.item__delete--btn',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = (number, type) => {
            
        // Округление число до сотых (Х.00) и переводит в строку
        number = Math.abs(number).toLocaleString('ru-RU');

        // Добавление + или - к доходам и расходам и возврат строки
        return (type === 'expense' ? '- ' : '+ ') + number
    };

    return {

        getInput() {
            return {
                type: $(domStrings.inputType).val(), // Будет либо expense, либо income
                description: $(domStrings.inputDescription).val(),
                value: parseFloat($(domStrings.inputValue).val())
            };
        },

        addListItem(obj, type) {
            let html, newHtml, element;

            // Создание HTML строки с плейсхолдером
            if (type === 'income') {
                element = domStrings.incomeContainer;
                html = '<div class="item" id="income-%id%"><div class="item__description">%description%</div><div class="item__right"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'expense') {
                element = domStrings.expenseContainer;
                html = '<div class="item" id="expense-%id%"><div class="item__description">%description%</div><div class="item__right"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Замена плейсхолдера на введенные данные
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Добавление HTML элемента в DOM
            $(element).append(newHtml);
        },

        deleteListItem(selectorId) {
            $('#' + selectorId).remove();
        },

        clearFields() {
            const fields = $(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fields.each((idx, elem) => $(elem).val(''));
            fields[0].focus();
        },

        displayBudget(obj) {
            obj.budget > 0 ? type = 'income' : type = 'expense';
            $(domStrings.budgetLabel).text(formatNumber(obj.budget, type));
            $(domStrings.incomeLabel).text(formatNumber(obj.totalIncome, 'income'));
            $(domStrings.expenseLabel).text(formatNumber(obj.totalExpense, 'expense'));

            if (obj.percentage > 0) {
                $(domStrings.percentageLabel).text(obj.percentage + '%');
            } else {
                $(domStrings.percentageLabel).text('---');
            }
        },

        displayPercentages(percentages) {
            const fields = $(domStrings.expensePercLabel);

            fields.each((idx, element) => {
                if (percentages[idx] > 0) {
                    $(element).text(percentages[idx] + '%');
                } else {
                    $(element).text('---');
                }
            });
        },

        displayDate() {
            const now = new Date();
            const year = now.getFullYear();
            const months = ['Январе', 'Феврале', 'Марте', 'Апреле', 'Мае', 'Июне', 'Июле', 'Августе', 'Сентябре', 'Октябре', 'Ноябре', 'Декабре'];
            const month = now.getMonth();
            $(domStrings.dateLabel).text(months[month] + ' ' + year)
        },

        changeType() {
            const fields  = $(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);
            fields.each((idx, element) => $(element).toggleClass('red-focus'));
            $(domStrings.inputButton).toggleClass('red');
        },

        getDOMStrings() {
            return domStrings;
        },
    };
})();


// Контроллер приложения
const controller = ((budgetCtrl, uiCtrl) => {

    const setupEventListeners = () => {
        const dom = uiCtrl.getDOMStrings();

        $(dom.inputButton).click(ctrlAddItem); 
        $(document).keypress((event) => {
            if (event.which === 13) {
                ctrlAddItem();
            }
        });

        $(dom.container).on('click', dom.deleteBtn, ctrlDeleteItem);
        $(dom.inputType).change(uiCtrl.changeType);

    };

    const updateBudget = () => {
        // Считает бюджет
        budgetCtrl.calculateBudget();

        // Получает бюджет
        const budget = budgetCtrl.getBudget();

        // Отображает бюджет в UI
        uiCtrl.displayBudget(budget);
    };

    const updatePercentages = () => {
        // Считает процент
        budgetCtrl.calculatePercentage();

        // Получает значение процентов из контроллера бюджета
        const percentages = budgetCtrl.getPercentages();

        // Обновляет UI с новыми процентами
        uiCtrl.displayPercentages(percentages);
    };

    const ctrlAddItem = () => {
        //  Получает значение поля ввода
        const input = uiCtrl.getInput();
        
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // Добавляет объект в кнотроллер бюджета
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Отображает объект в UI
            uiCtrl.addListItem(newItem, input.type);
            uiCtrl.clearFields();

            // Считает и обновляет бюджет
            updateBudget();
            
            // Обновляет проценты
            updatePercentages();
        }
    };

    const ctrlDeleteItem = (event) => {
        const itemId = $(event.target).closest('div.item').attr('id');

        if (itemId) {
            let splitId = itemId.split('-');
            let type = splitId[0];
            let id = parseInt(splitId[1], 10);

            // Удаляет объект из массива expense или income
            budgetCtrl.deleteItem(type, id);

            // Удаляет объект из UI
            uiCtrl.deleteListItem(itemId);

            // Обновляет и показывает бюджет
            updateBudget();
        }
        
    };

    return {
        init() {
            uiCtrl.displayDate();
            setupEventListeners();
        }
    };
})(budgetController, uiController);

// Запускает приложение, используя JQuery
$(() => {
    controller.init();
});