#!/bin/sh

PROM_EXPORTER_BIN="/usr/bin/nginx-prometheus-exporter"
PROM_EXPORTER_PORT=32032
PROM_STATUS_FILE="/tmp/status"

# ----

function create_empty_prom_file () {
  # Create an empty prom file with the most basic metric
  echo '# HELP nginx_up Status of the last metric scrape' > "${PROM_STATUS_FILE}"
  echo '# TYPE nginx_up gauge' >> "${PROM_STATUS_FILE}"
  echo 'nginx_up 1' >> "${PROM_STATUS_FILE}"
}

function scrape () {
  if [ ! -f $PROM_EXPORTER_BIN ]; then
    return
  fi

  # All the metrics
  curl -s "http://127.0.0.1:${PROM_EXPORTER_PORT}/metrics" 2> /dev/null > "${PROM_STATUS_FILE}"
  CURL_EXIT_CODE=$?

  if [ $CURL_EXIT_CODE -ne 0 ]; then
    echo "Error: cannot connect to nginx-prometheus-exporter under http://127.0.0.1:${PROM_EXPORTER_PORT}/metrics"
    create_empty_prom_file
    return
  fi

  # Let's do some bash magic ;-)
  RSS_MEM_NGINX=$(ps -o comm,rss | grep "nginx" | grep -v "prom" | cut -d ' ' -f 2- | paste -s -d+ - | bc)

  # Add memory consumption
  echo '# HELP nginx_process_rss Memory usage of all nginx processes (incl. child_procs) in bytes' >> "${PROM_STATUS_FILE}"
  echo '# TYPE nginx_process_rss gauge' >> "${PROM_STATUS_FILE}"
  echo "nginx_process_rss $RSS_MEM_NGINX" >> "${PROM_STATUS_FILE}"
}

# ----

echo "going to listen on port: ${NGINX_PORT} (see NGINX_PORT env)"

# Prepare the status route
create_empty_prom_file

# Run nginx
( exec nginx -g 'daemon off;' ) &
NGINX_PID=$!
echo "nginx started, pid: ${NGINX_PID}"

# Start nginx status scraper
if [ -f $PROM_EXPORTER_BIN ]; then
  sleep 10 # Wait until nginx runs

  $PROM_EXPORTER_BIN -nginx.scrape-uri "http://127.0.0.1:${NGINX_PORT}/nginx_status" -web.listen-address "127.0.0.1:${PROM_EXPORTER_PORT}" &
  PROM_EXPORTER_PID=$!

  echo "nginx-prometheus-exporter running; PID: $PROM_EXPORTER_PID"
else
  echo "WARNING: nginx-prometheus-exporter binary not available under ${PROM_EXPORTER_BIN}"
  echo "         therefore not enabled! You don't get prometheus metrics!"
fi

# Run scraping forever
while true; do
  scrape
  sleep 21
done

# Done (never reached)
