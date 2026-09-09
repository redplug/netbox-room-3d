FROM netboxcommunity/netbox:v4.5.0
COPY . /plugin
RUN /usr/local/bin/uv pip install --python /opt/netbox/venv/bin/python /plugin
