
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <iomanip>
#include <algorithm>

using namespace std;

const int SLOTS = 7;
const double SLOT_HOURS = 2.0;
const double EPS = 1e-9;
const double INF = 1e100;

const string TIME_SLOTS[SLOTS] = {
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM"
};

struct Parent {
    int previousBattery = -1;
    string action;
    int energySteps = 0;
};

struct SlotResult {
    string action;
    double socAfter = 0;
    double energyBought = 0;
    double energySold = 0;
    double profit = 0;
};

int main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 1. Battery configuration
    double capacity, initialSOC, resolution;
    double maxChargePower, maxDischargePower;
    double etaC, etaD, degradationCost;

    if (!(cin >> capacity >> initialSOC >> resolution
              >> maxChargePower >> maxDischargePower
              >> etaC >> etaD >> degradationCost)) {

        cerr << "Invalid battery configuration\n";
        return 1;
    }

    // 2. Read 7 electricity prices
    vector<double> prices(SLOTS);

    for (int i = 0; i < SLOTS; i++) {

        if (!(cin >> prices[i]) ||
            !isfinite(prices[i]) || prices[i] < 0) {

            cerr << "Exactly 7 valid prices are required\n";
            return 1;
        }
    }

    // 3. Validate battery parameters
    if (!isfinite(capacity) || !isfinite(initialSOC) ||
        !isfinite(resolution) || !isfinite(maxChargePower) ||
        !isfinite(maxDischargePower) || !isfinite(etaC) ||
        !isfinite(etaD) || !isfinite(degradationCost) ||
        capacity <= 0 || resolution <= 0 ||
        initialSOC < 0 || initialSOC > capacity ||
        maxChargePower < 0 || maxDischargePower < 0 ||
        etaC <= 0 || etaC > 1 ||
        etaD <= 0 || etaD > 1 ||
        degradationCost < 0) {

        cerr << "Invalid battery parameters\n";
        return 1;
    }

    int capacitySteps = (int)llround(capacity / resolution);
    int initialSteps = (int)llround(initialSOC / resolution);

    if (capacitySteps <= 0 ||
        fabs(capacitySteps * resolution - capacity) > EPS ||
        fabs(initialSteps * resolution - initialSOC) > EPS) {

        cerr << "Capacity and initial SOC must match resolution\n";
        return 1;
    }

    // 4. Maximum energy movement in a 2-hour slot
    int maxChargeSteps = (int)floor(
        etaC * maxChargePower * SLOT_HOURS
        / resolution + EPS
    );

    int maxDischargeSteps = (int)floor(
        maxDischargePower * SLOT_HOURS
        / (etaD * resolution) + EPS
    );

    // 5. Initialize DP and parent tables
    vector<vector<double>> dp(
        SLOTS + 1,
        vector<double>(capacitySteps + 1, -INF)
    );

    vector<vector<Parent>> parent(
        SLOTS + 1,
        vector<Parent>(capacitySteps + 1)
    );

    // Initial battery charge
    dp[0][initialSteps] = 0;

    // 6. Dynamic Programming
    for (int slot = 0; slot < SLOTS; slot++) {

        for (int battery = 0;
             battery <= capacitySteps; battery++) {

            if (dp[slot][battery] <= -INF / 2)
                continue;

            double currentProfit = dp[slot][battery];

            // ACTION 1: IDLE
            if (currentProfit >
                dp[slot + 1][battery] + EPS) {

                dp[slot + 1][battery] = currentProfit;

                parent[slot + 1][battery] = {
                    battery, "IDLE", 0
                };
            }

            // ACTION 2: CHARGE
            int possibleCharge = min(
                maxChargeSteps,
                capacitySteps - battery
            );

            for (int delta = 1;
                 delta <= possibleCharge; delta++) {

                int nextBattery = battery + delta;

                double internalEnergy = delta * resolution;

                double energyPurchased =
                    internalEnergy / etaC;

                double cost =
                    prices[slot] * energyPurchased
                    + degradationCost * internalEnergy;

                double newProfit = currentProfit - cost;

                if (newProfit >
                    dp[slot + 1][nextBattery] + EPS) {

                    dp[slot + 1][nextBattery] = newProfit;

                    parent[slot + 1][nextBattery] = {
                        battery, "CHARGE", delta
                    };
                }
            }

            // ACTION 3: DISCHARGE
            int possibleDischarge = min(
                maxDischargeSteps,
                battery
            );

            for (int delta = 1;
                 delta <= possibleDischarge; delta++) {

                int nextBattery = battery - delta;

                double internalEnergy = delta * resolution;

                double energySold = internalEnergy * etaD;

                double revenue = prices[slot] * energySold;

                double wearCost =
                    degradationCost * internalEnergy;

                double newProfit =
                    currentProfit + revenue - wearCost;

                if (newProfit >
                    dp[slot + 1][nextBattery] + EPS) {

                    dp[slot + 1][nextBattery] = newProfit;

                    parent[slot + 1][nextBattery] = {
                        battery, "DISCHARGE", delta
                    };
                }
            }
        }
    }

    // 7. Final SOC must equal initial SOC
    double maximumProfit = dp[SLOTS][initialSteps];

    if (maximumProfit <= -INF / 2) {
        cerr << "No feasible schedule found\n";
        return 1;
    }

    // 8. Backtracking
    vector<SlotResult> schedule(SLOTS);

    int currentBattery = initialSteps;

    for (int slot = SLOTS; slot >= 1; slot--) {

        Parent p = parent[slot][currentBattery];

        if (p.previousBattery == -1) {
            cerr << "Backtracking failed\n";
            return 1;
        }

        double internalEnergy =
            p.energySteps * resolution;

        SlotResult result;

        result.action = p.action;
        result.socAfter = currentBattery * resolution;

        if (p.action == "CHARGE") {

            result.energyBought = internalEnergy / etaC;

            result.profit =
                -prices[slot - 1] * result.energyBought
                - degradationCost * internalEnergy;
        }
        else if (p.action == "DISCHARGE") {

            result.energySold = internalEnergy * etaD;

            result.profit =
                prices[slot - 1] * result.energySold
                - degradationCost * internalEnergy;
        }

        schedule[slot - 1] = result;

        currentBattery = p.previousBattery;
    }

    // 9. JSON output for backend integration
    cout << fixed << setprecision(4);

    cout << "{\n";
    cout << "\"algorithm\":\"Dynamic Programming\",\n";
    cout << "\"timeSlots\":" << SLOTS << ",\n";
    cout << "\"slotDurationHours\":" << SLOT_HOURS << ",\n";
    cout << "\"maximumProfit\":" << maximumProfit << ",\n";
    cout << "\"initialSOC\":" << initialSOC << ",\n";
    cout << "\"finalSOC\":" << currentBattery * resolution << ",\n";

    cout << "\"schedule\":[\n";

    for (int i = 0; i < SLOTS; i++) {

        cout << "{";
        cout << "\"slot\":" << i + 1 << ",";
        cout << "\"time\":\"" << TIME_SLOTS[i] << "\",";
        cout << "\"price\":" << prices[i] << ",";
        cout << "\"action\":\"" << schedule[i].action << "\",";
        cout << "\"socAfter\":" << schedule[i].socAfter << ",";
        cout << "\"energyBought\":" << schedule[i].energyBought << ",";
        cout << "\"energySold\":" << schedule[i].energySold << ",";
        cout << "\"profit\":" << schedule[i].profit;
        cout << "}";

        if (i != SLOTS - 1)
            cout << ",";

        cout << "\n";
    }

    cout << "],\n";

    // 10. Export DP table
    cout << "\"dpTable\":[\n";

    for (int i = 0; i <= SLOTS; i++) {

        cout << "[";

        for (int b = 0; b <= capacitySteps; b++) {

            if (dp[i][b] <= -INF / 2)
                cout << "null";
            else
                cout << dp[i][b];

            if (b != capacitySteps)
                cout << ",";
        }

        cout << "]";

        if (i != SLOTS)
            cout << ",";

        cout << "\n";
    }

    cout << "]\n";
    cout << "}\n";

    return 0;
}
