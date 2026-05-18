// src/components/dashboard/ActiveGoals.jsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const ActiveGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await apiFetch('/finance/goals/');
        setGoals(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch goals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ahead':
        return <TrendingUp size={16} className="text-emerald-400" />;
      case 'behind':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return <Minus size={16} className="text-blue-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ahead':
        return `Ahead of pace`;
      case 'behind':
        return `Behind pace`;
      default:
        return 'On track';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'behind':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="h-full">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Goals</h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center transition-colors duration-300">
            View All <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin text-emerald-400" size={24} />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              No active goals. Set a goal to start saving!
            </div>
          ) : (
            goals.map((goal) => {
              const currentAmt = parseFloat(goal.current_amount || 0);
              const targetAmt = parseFloat(goal.target_amount || 1);
              const percentage = (currentAmt / targetAmt) * 100;
              const status = goal.priority === 'high' && percentage < 50 ? 'behind' : 'ahead';
              return (
                <div
                  key={goal.id}
                  className="border border-white/10 rounded-xl p-3 sm:p-4 hover:border-emerald-500/30 hover:bg-white/5 transition-all duration-300 cursor-pointer bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-sm">{goal.name}</h3>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-400">{percentage.toFixed(0)}%</span>
                      <span className="text-gray-400 truncate ml-2">₹{currentAmt.toLocaleString()} / ₹{targetAmt.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'ahead' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                          status === 'behind' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                          'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target</span>
                      <span className="font-medium text-white">{goal.deadline || 'No deadline'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Monthly</span>
                      <span className="font-medium text-white">₹{parseFloat(goal.monthly_target || 0).toFixed(0)}/mo</span>
                    </div>
                    <div className={`flex items-center justify-between px-2 py-1 rounded border ${getStatusColor(status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(status)}
                        <span className="font-medium text-xs truncate">{getStatusText(status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button className="w-full mt-4 py-3 text-sm text-emerald-400 hover:text-emerald-300 font-medium border-2 border-dashed border-emerald-500/30 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 backdrop-blur-sm">
          + Create New Goal
        </button>
      </div>
    </div>
  );
};

export default ActiveGoals;