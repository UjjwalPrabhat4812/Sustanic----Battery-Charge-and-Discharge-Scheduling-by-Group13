
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

const string TIME_SLOTS[SLOTS] = {
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM"
};

struct Opportunity {
    int firstSlot;
    int secondSlot;

    // BUY_SELL: charge first, discharge later
    // SELL_BUY: discharge first, charge later
    string type;

    double profitPerKWh;
};

struct SlotResult {
    string action = "IDLE";
    double socAfter = 0;
    double energyBought = 0;
    double energySold = 0;
    double profit = 0;
};

int main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 1. Read battery configuration
    double capacity, initialSOC, resolution;
    double maxChargePower, maxDischargePower;
    double etaC, etaD, degradationCost;

    if (!(cin >> capacity >> initialSOC >> resolution
              >> maxChargePower >> maxDischargePower
              >> etaC >> etaD >> degradationCost)) {

        cerr << "Invalid battery configuration\n";
        return 1;
    }

    // 2. Read seven electricity prices
    vector<double> prices(SLOTS);

    for (int i = 0; i < SLOTS; i++) {

        if (!(cin >> prices[i]) ||
            !isfinite(prices[i]) || prices[i] < 0) {

            cerr << "Exactly 7 valid prices are required\n";
            return 1;
        }
    }

    // 3. Validate configuration
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

    // 4. Calculate maximum energy movement per slot
    int maxChargeSteps = (int)floor(
        etaC * maxChargePower * SLOT_HOURS
        / resolution + EPS
    );

    int maxDischargeSteps = (int)floor(
        maxDischargePower * SLOT_HOURS
        / (etaD * resolution) + EPS
    );

    // 5. Generate all possible profitable opportunities
    vector<Opportunity> opportunities;

    for (int i = 0; i < SLOTS; i++) {

        for (int j = i + 1; j < SLOTS; j++) {

            // Opportunity A:
            // Buy at i, sell at j
            double buySellProfit =
                prices[j] * etaD
                - prices[i] / etaC
                - 2.0 * degradationCost;

            if (buySellProfit > EPS) {

                opportunities.push_back({
                    i, j, "BUY_SELL", buySellProfit
                });
            }

            // Opportunity B:
            // Sell at i, buy back at j
            double sellBuyProfit =
                prices[i] * etaD
                - prices[j] / etaC
                - 2.0 * degradationCost;

            if (sellBuyProfit > EPS) {

                opportunities.push_back({
                    i, j, "SELL_BUY", sellBuyProfit
                });
            }
        }
    }

    // 6. Sort opportunities by maximum profit per internal kWh
    sort(
        opportunities.begin(),
        opportunities.end(),
        [](const Opportunity& a, const Opportunity& b) {

            if (fabs(a.profitPerKWh - b.profitPerKWh) > EPS)
                return a.profitPerKWh > b.profitPerKWh;

            if (a.firstSlot != b.firstSlot)
                return a.firstSlot < b.firstSlot;

            if (a.secondSlot != b.secondSlot)
                return a.secondSlot < b.secondSlot;

            return a.type < b.type;
        }
    );

    // 7. Track allocated energy
    vector<int> chargeUsed(SLOTS, 0);
    vector<int> dischargeUsed(SLOTS, 0);

    // 0 = IDLE, 1 = CHARGE, -1 = DISCHARGE
    vector<int> actionType(SLOTS, 0);

    // SOC change at each boundary after a completed slot
    vector<int> socChange(SLOTS + 1, 0);

    // 8. Greedy allocation
    for (const auto& opportunity : opportunities) {

        int first = opportunity.firstSlot;
        int second = opportunity.secondSlot;

        int chargeSlot, dischargeSlot;
        int direction;

        if (opportunity.type == "BUY_SELL") {

            chargeSlot = first;
            dischargeSlot = second;

            // Battery temporarily gains energy
            direction = 1;
        }
        else {

            dischargeSlot = first;
            chargeSlot = second;

            // Battery temporarily loses energy
            direction = -1;
        }

        // Check that neither slot performs conflicting actions
        if (actionType[chargeSlot] == -1 ||
            actionType[dischargeSlot] == 1) {
            continue;
        }

        // Allocate energy one discrete unit at a time
        while (
            chargeUsed[chargeSlot] < maxChargeSteps &&
            dischargeUsed[dischargeSlot] < maxDischargeSteps
        ) {

            bool feasible = true;

            // Check battery SOC at every intermediate boundary
            for (int k = first + 1; k <= second; k++) {

                int newSOC =
                    initialSteps + socChange[k] + direction;

                if (newSOC < 0 || newSOC > capacitySteps) {
                    feasible = false;
                    break;
                }
            }

            if (!feasible)
                break;

            // Allocate one energy unit
            chargeUsed[chargeSlot]++;
            dischargeUsed[dischargeSlot]++;

            actionType[chargeSlot] = 1;
            actionType[dischargeSlot] = -1;

            // Update intermediate battery levels
            for (int k = first + 1; k <= second; k++) {
                socChange[k] += direction;
            }
        }
    }

    // 9. Reconstruct seven-slot schedule
    vector<SlotResult> schedule(SLOTS);

    int currentBattery = initialSteps;
    double totalProfit = 0;

    for (int i = 0; i < SLOTS; i++) {

        SlotResult result;

        if (actionType[i] == 1) {

            result.action = "CHARGE";

            double internalEnergy =
                chargeUsed[i] * resolution;

            result.energyBought = internalEnergy / etaC;

            result.profit =
                -prices[i] * result.energyBought
                - degradationCost * internalEnergy;

            currentBattery += chargeUsed[i];
        }
        else if (actionType[i] == -1) {

            result.action = "DISCHARGE";

            double internalEnergy =
                dischargeUsed[i] * resolution;

            result.energySold = internalEnergy * etaD;

            result.profit =
                prices[i] * result.energySold
                - degradationCost * internalEnergy;

            currentBattery -= dischargeUsed[i];
        }

        result.socAfter = currentBattery * resolution;

        schedule[i] = result;

        totalProfit += result.profit;
    }

    // 10. Verify final battery charge
    if (currentBattery != initialSteps) {

        cerr << "Final SOC constraint violated\n";
        return 1;
    }

    // 11. JSON output
    cout << fixed << setprecision(4);

    cout << "{\n";
    cout << "\"algorithm\":\"Greedy\",\n";
    cout << "\"timeSlots\":" << SLOTS << ",\n";
    cout << "\"slotDurationHours\":" << SLOT_HOURS << ",\n";
    cout << "\"netProfit\":" << totalProfit << ",\n";
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

    cout << "]\n";
    cout << "}\n";

    return 0;
}
