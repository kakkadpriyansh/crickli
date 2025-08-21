import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, TrendingUp, TrendingDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '../lib/utils';

const Calculator: React.FC = () => {
  const [backOdds, setBackOdds] = useState<string>('');
  const [layOdds, setLayOdds] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [oddsFormat, setOddsFormat] = useState<'decimal' | 'fractional'>('decimal');

  // Convert fractional odds to decimal
  const fractionalToDecimal = (fractional: string): number => {
    if (!fractional.includes('/')) return parseFloat(fractional) || 0;
    const [numerator, denominator] = fractional.split('/').map(n => parseFloat(n));
    if (denominator === 0) return 0;
    return (numerator / denominator) + 1;
  };

  // Convert decimal odds to fractional
  const decimalToFractional = (decimal: number): string => {
    if (decimal <= 1) return '0/1';
    const fraction = decimal - 1;
    
    // Find the greatest common divisor
    const gcd = (a: number, b: number): number => {
      return b === 0 ? a : gcd(b, a % b);
    };
    
    // Convert to fraction
    const denominator = 100;
    const numerator = Math.round(fraction * denominator);
    const divisor = gcd(numerator, denominator);
    
    return `${numerator / divisor}/${denominator / divisor}`;
  };

  // Parse odds based on current format
  const parseOdds = (value: string): number => {
    if (!value) return 0;
    return oddsFormat === 'decimal' ? parseFloat(value) : fractionalToDecimal(value);
  };

  // Calculate results
  const calculateResults = () => {
    const backOddsDecimal = parseOdds(backOdds);
    const layOddsDecimal = parseOdds(layOdds);
    const stake = parseFloat(stakeAmount) || 0;

    if (backOddsDecimal <= 0 || layOddsDecimal <= 0 || stake <= 0) {
      return {
        teamWins: { backProfit: 0, layLoss: 0, netResult: 0 },
        teamLoses: { backLoss: 0, layProfit: 0, netResult: 0 }
      };
    }

    // If team wins
    const backProfit = (backOddsDecimal - 1) * stake;
    const layLoss = (layOddsDecimal - 1) * stake;
    const teamWinsNet = backProfit - layLoss;

    // If team loses
    const backLoss = stake;
    const layProfit = stake;
    const teamLosesNet = layProfit - backLoss;

    return {
      teamWins: { backProfit, layLoss, netResult: teamWinsNet },
      teamLoses: { backLoss, layProfit, netResult: teamLosesNet }
    };
  };

  const results = calculateResults();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatOddsDisplay = (value: string): string => {
    if (!value) return '';
    if (oddsFormat === 'decimal') {
      return value;
    } else {
      const decimal = parseFloat(value);
      return decimal > 0 ? decimalToFractional(decimal) : value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <CalculatorIcon className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cricket Khai-Lagai Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your profit and loss for back (khai) and lay (lagai) bets. 
            Enter your odds and stake to see potential outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bet Details</h2>
            
            {/* Odds Format Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Odds Format</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setOddsFormat('decimal')}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
                    oddsFormat === 'decimal'
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {oddsFormat === 'decimal' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>Decimal</span>
                </button>
                <button
                  onClick={() => setOddsFormat('fractional')}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
                    oddsFormat === 'fractional'
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {oddsFormat === 'fractional' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>Fractional</span>
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back Odds (Khai) {oddsFormat === 'fractional' && <span className="text-gray-500">(e.g., 3/1)</span>}
                </label>
                <input
                  type="text"
                  value={backOdds}
                  onChange={(e) => setBackOdds(e.target.value)}
                  placeholder={oddsFormat === 'decimal' ? '2.50' : '3/2'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lay Odds (Lagai) {oddsFormat === 'fractional' && <span className="text-gray-500">(e.g., 2/1)</span>}
                </label>
                <input
                  type="text"
                  value={layOdds}
                  onChange={(e) => setLayOdds(e.target.value)}
                  placeholder={oddsFormat === 'decimal' ? '2.00' : '1/1'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stake Amount (₹)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Formula Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Formula:</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div><strong>Back Bet:</strong> Profit = (Odds - 1) × Stake, Loss = Stake</div>
                <div><strong>Lay Bet:</strong> Profit = Stake, Liability = (Odds - 1) × Stake</div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Team Wins Scenario */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">If Team Wins</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Back Bet Profit:</span>
                  <span className="font-medium text-green-600">+{formatCurrency(results.teamWins.backProfit)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lay Bet Loss:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(results.teamWins.layLoss)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                  <span className="font-semibold text-gray-900">Net Result:</span>
                  <span className={cn(
                    'font-bold text-lg',
                    results.teamWins.netResult >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {results.teamWins.netResult >= 0 ? '+' : '-'}{formatCurrency(results.teamWins.netResult)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Loses Scenario */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">If Team Loses</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Back Bet Loss:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(results.teamLoses.backLoss)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lay Bet Profit:</span>
                  <span className="font-medium text-green-600">+{formatCurrency(results.teamLoses.layProfit)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                  <span className="font-semibold text-gray-900">Net Result:</span>
                  <span className={cn(
                    'font-bold text-lg',
                    results.teamLoses.netResult >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {results.teamLoses.netResult >= 0 ? '+' : '-'}{formatCurrency(results.teamLoses.netResult)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {(backOdds && layOdds && stakeAmount) && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700 mb-1">Best Case Scenario</div>
                <div className={cn(
                  'text-2xl font-bold',
                  Math.max(results.teamWins.netResult, results.teamLoses.netResult) >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {Math.max(results.teamWins.netResult, results.teamLoses.netResult) >= 0 ? '+' : '-'}
                  {formatCurrency(Math.max(results.teamWins.netResult, results.teamLoses.netResult))}
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-700 mb-1">Worst Case Scenario</div>
                <div className={cn(
                  'text-2xl font-bold',
                  Math.min(results.teamWins.netResult, results.teamLoses.netResult) >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {Math.min(results.teamWins.netResult, results.teamLoses.netResult) >= 0 ? '+' : '-'}
                  {formatCurrency(Math.min(results.teamWins.netResult, results.teamLoses.netResult))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;