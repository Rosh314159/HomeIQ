import numpy as np
import math

# Helper function to calculate UK post-tax annual income (Income Tax + National Insurance)
def calculate_post_tax_income(annual_salary):
    # UK Income Tax bands (2025/26)
    personal_allowance = 12570
    basic_rate_limit = 50270
    higher_rate_limit = 125140

    # Personal allowance tapers by £1 for every £2 earned over £100,000
    if annual_salary > 100000:
        reduction = min(personal_allowance, (annual_salary - 100000) / 2)
        effective_personal_allowance = personal_allowance - reduction
    else:
        effective_personal_allowance = personal_allowance

    # Income Tax calculation
    taxable_income = max(0, annual_salary - effective_personal_allowance)
    income_tax = 0

    basic_band = max(0, basic_rate_limit - effective_personal_allowance)
    higher_band = higher_rate_limit - basic_rate_limit

    if taxable_income <= basic_band:
        income_tax = taxable_income * 0.20
    elif taxable_income <= basic_band + higher_band:
        income_tax = basic_band * 0.20 + (taxable_income - basic_band) * 0.40
    else:
        income_tax = basic_band * 0.20 + higher_band * 0.40 + (taxable_income - basic_band - higher_band) * 0.45

    # National Insurance (Class 1 employee, 2025/26)
    ni_primary_threshold = 12570
    ni_upper_earnings_limit = 50270
    national_insurance = 0

    if annual_salary > ni_primary_threshold:
        ni_basic = min(annual_salary, ni_upper_earnings_limit) - ni_primary_threshold
        national_insurance = ni_basic * 0.08
        if annual_salary > ni_upper_earnings_limit:
            national_insurance += (annual_salary - ni_upper_earnings_limit) * 0.02

    return annual_salary - income_tax - national_insurance

# Helper function to calculate monthly mortgage payment
def calculate_monthly_payment(principal, annual_rate, term_years):
    monthly_rate = annual_rate / 12 / 100
    num_payments = term_years * 12
    if monthly_rate == 0:
        return principal / num_payments
    return principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)

# Helper function to calculate stamp duty
def calculate_stamp_duty(house_price, is_first_home):
    if is_first_home:
        if house_price <= 300000:
            return 0
        elif house_price <= 500000:
            return (house_price - 300000) * 0.05
        else:
            return (200000 * 0.05) + ((house_price - 500000) * 0.10)
    else:
        if house_price <= 125000:
            return 0
        elif house_price <= 250000:
            return (house_price - 125000) * 0.02
        elif house_price <= 925000:
            return (125000 * 0.02) + ((house_price - 250000) * 0.05)
        elif house_price <= 1500000:
            return (125000 * 0.02) + (675000 * 0.05) + ((house_price - 925000) * 0.10)
        else:
            return (125000 * 0.02) + (675000 * 0.05) + (575000 * 0.10) + ((house_price - 1500000) * 0.12)

# Feasibility assessment function
def get_feasibility(system_inputs, user_inputs):
    house_price = float(system_inputs['house_price'])
    loan_term_years = int(system_inputs['loan_term_years'])
    interest_rate = float(system_inputs['interest_rate'])
    utility_bills = float(system_inputs['utility_bills'])

    annual_income = float(user_inputs['annual_income'])
    debt_obligations = float(user_inputs['debt_obligations'])
    savings = float(user_inputs['savings'])
    is_first_home = bool(user_inputs['is_first_home'])

    monthly_income = annual_income / 12
    loan_amount = max(0, house_price - savings)
    ltv_ratio = max(0, (loan_amount / house_price) * 100)
    monthly_utility_bills = utility_bills / 12
    
    #Change interest rate based on LTV ratio (data from Rightmove)
    if ltv_ratio >= 0.90:
        interest_rate = 5.77
    elif ltv_ratio >= 0.85:
        interest_rate = 5.55
    elif ltv_ratio >= 0.80:
        interest_rate = 5.48
    elif ltv_ratio >= 0.6:
        interest_rate = 5.18
    else:
        interest_rate = 4.95

    monthly_payment = calculate_monthly_payment(loan_amount, interest_rate, loan_term_years)
    stamp_duty = calculate_stamp_duty(house_price, is_first_home)
    total_housing_costs_monthly = monthly_payment + monthly_utility_bills

    dti_ratio = (debt_obligations + total_housing_costs_monthly) / monthly_income * 100
    
    mortgage_to_income_ratio = loan_amount / annual_income
    meets_mortgage_income_threshold = mortgage_to_income_ratio <= 4.5
    meets_ltv_threshold = ltv_ratio <= 95
    meets_dti_ratio = dti_ratio < 36

    # Bills-to-income check: total monthly housing bills must be < 50% of post-tax income
    annual_post_tax_income = calculate_post_tax_income(annual_income)
    monthly_post_tax_income = annual_post_tax_income / 12
    bills_to_income_ratio = (total_housing_costs_monthly / monthly_post_tax_income) * 100 if monthly_post_tax_income > 0 else 100
    meets_bills_to_income = bills_to_income_ratio < 50

    is_affordable = meets_dti_ratio and meets_mortgage_income_threshold and meets_ltv_threshold and meets_bills_to_income

    recommendations = []
    if not meets_mortgage_income_threshold:
        recommendations.append("You have exceeded the mortgage to income ratio - consider a house with a lower price or increase deposit to reduce the required mortgage")
    if not meets_ltv_threshold:
        recommendations.append("Increase your deposit to lower the loan-to-value ratio.")
    if not meets_dti_ratio:
        recommendations.append("You have exceeded the debt to income ratio - lower your monthly debt or increase monthly income")
    if not meets_bills_to_income:
        recommendations.append("Your total monthly housing bills (mortgage, water, heating and lighting) exceed 50% of your post-tax income - consider a cheaper property or increase your deposit to reduce mortgage payments")

    return {
        'monthly_payment': round(monthly_payment, 2),
        'total_housing_costs': round(total_housing_costs_monthly, 2),
        'stamp_duty': round(stamp_duty, 2),
        'dti_ratio': round(dti_ratio, 2),
        'ltv_ratio': round(ltv_ratio, 2),
        'mortgage_to_income_ratio': round(mortgage_to_income_ratio, 2),
        'bills_to_income_ratio': round(bills_to_income_ratio, 2),
        'is_affordable': is_affordable,
        'meets_ltv_threshold': meets_ltv_threshold,
        'meets_mortgage_income_threshold': meets_mortgage_income_threshold,
        'meets_bills_to_income': meets_bills_to_income,
        'recommendations': recommendations,
        'monthly_debt_obligations': debt_obligations,
        'monthly_income': monthly_income,
        'monthly_post_tax_income': round(monthly_post_tax_income, 2)
    }
