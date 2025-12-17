#include <node_api.h>
#include <atomic>
#include <cstdint>
#include <chrono>
#include <limits>
#include <ctime>
#include <string>

#define NAPI_STATUS_THROWS(call) \
	{ \
		napi_status status = (call); \
		if (status != napi_ok) { \
			const napi_extended_error_info* error; \
			std::string errorStr = "Unknown error"; \
			if (::napi_get_last_error_info(env, &error) == napi_ok && error->error_message) { \
				errorStr = error->error_message; \
			} \
			::napi_throw_error(env, nullptr, errorStr.c_str()); \
			return nullptr; \
		} \
	}

static std::atomic<double> lastTimestamp{0.0};

napi_value MonotonicTimeFn(napi_env env, napi_callback_info info) {
	int64_t now = std::chrono::duration_cast<std::chrono::nanoseconds>(
		std::chrono::system_clock::now().time_since_epoch()
	).count();

	double result = static_cast<double>(now) / 1000000.0;

	double last = lastTimestamp.load(std::memory_order_acquire);
	if (result <= last) {
		result = std::nextafter(last, std::numeric_limits<double>::infinity());
	}

	while (!lastTimestamp.compare_exchange_strong(last, result, std::memory_order_acq_rel)) {
		if (result <= last) {
			result = std::nextafter(last, std::numeric_limits<double>::infinity());
		}
	}

	napi_value resultValue;
	NAPI_STATUS_THROWS(::napi_create_double(env, result, &resultValue));
	return resultValue;
}

NAPI_MODULE_INIT() {
	napi_value monotonicTimeFn;
	NAPI_STATUS_THROWS(::napi_create_function(env, "monotonicTime", NAPI_AUTO_LENGTH, MonotonicTimeFn, nullptr, &monotonicTimeFn));
	NAPI_STATUS_THROWS(::napi_set_named_property(env, exports, "monotonicTime", monotonicTimeFn));

	return exports;
}
